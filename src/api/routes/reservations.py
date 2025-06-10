from flask import request, jsonify
from datetime import datetime
from sqlalchemy import select, or_, func
from src.api import db
from src.api.models import Reservation, Table, reservation_status, table_status
from src.api.utils import send_email_reservation
from . import api

@api.route('/reservations', methods=['POST', 'GET'])
def create_reservation():
    if request.method == 'POST':
        data = request.get_json()
        try:
            # Validar status
            status_str = data.get("status", "PENDIENTE").upper()
            if status_str not in reservation_status.__members__:
                return jsonify({
                    "error": f"Estado inválido. Usa uno de: {[s.name for s in reservation_status]}"
                }), 400
            status_enum = reservation_status[status_str]

            # Crear reserva
            new_reservation = Reservation(
                user_id=data.get("user_id"),
                guest_name=data["guest_name"],
                guest_phone=data["guest_phone"],
                email=data["email"],
                quantity=data["quantity"],
                table_id=data.get("table_id"),
                status=status_enum,
                start_date_time=datetime.strptime(data["start_date_time"], "%Y-%m-%d %H:%M:%S"),
                additional_details=data.get("additional_details")
            )

            db.session.add(new_reservation)

            if data.get("table_id") and status_enum in [reservation_status.PENDIENTE, reservation_status.CONFIRMADA]:
                table = db.session.get(Table, data["table_id"])
                if table:
                    table.status = table_status.RESERVADA

            db.session.commit()

            email_sent = send_email_reservation(data)

            return jsonify({
                "msg": "Reservación creada exitosamente",
                "reservation_id": new_reservation.id,
                "email_sent": email_sent
            }), 201

        except Exception as e:
            db.session.rollback()
            print("Error al crear reservación:", e)
            return jsonify({"error": str(e)}), 500

    if request.method == 'GET':
        try:
            page = int(request.args.get("page", 1))
            per_page = int(request.args.get("per_page", 10))
            search = request.args.get("search", "").strip()
            status_filter = request.args.get("status", "").upper().strip()
            date_filter = request.args.get("date", "").strip()

            stmt = select(Reservation)

            if search:
                stmt = stmt.where(
                    or_(
                        Reservation.guest_name.ilike(f"%{search}%"),
                        Reservation.email.ilike(f"%{search}%")
                    )
                )

            if status_filter:
                if status_filter in reservation_status.__members__:
                    stmt = stmt.where(Reservation.status == reservation_status[status_filter])
                else:
                    return jsonify({
                        "error": f"Estado inválido. Usa uno de: {[s.name for s in reservation_status]}"
                    }), 400

            if date_filter:
                try:
                    date_obj = datetime.strptime(date_filter, "%Y-%m-%d").date()
                    stmt = stmt.where(func.date(Reservation.start_date_time) == date_obj)
                except ValueError:
                    return jsonify({"error": "Formato de fecha inválido. Usa YYYY-MM-DD"}), 400

            total = db.session.scalar(select(func.count()).select_from(stmt.subquery()))

            stmt = stmt.order_by(Reservation.start_date_time.desc()).offset((page - 1) * per_page).limit(per_page)
            reservations = db.session.scalars(stmt).all()

            return jsonify({
                "total": total,
                "page": page,
                "per_page": per_page,
                "pages": (total + per_page - 1) // per_page,
                "items": [res.serialize() for res in reservations]
            }), 200

        except Exception as e:
            print("Error en GET /reservations:", e)
            return jsonify({"error": str(e)}), 500

@api.route('/reservations/<int:id>', methods=['PUT'])
def update_reservation(id):
    try:
        data = request.get_json()
        reserva = Reservation.query.get(id)

        if not reserva:
            return jsonify({"error": "Reserva no encontrada"}), 404

        reserva.guest_name = data.get('guest_name', reserva.guest_name)
        reserva.email = data.get('email', reserva.email)
        reserva.guest_phone = data.get('guest_phone', reserva.guest_phone)
        reserva.quantity = data.get('quantity', reserva.quantity)
        reserva.additional_details = data.get('additional_details', reserva.additional_details)

        new_status = data.get('status', reserva.status)
        if new_status and isinstance(new_status, str):
            new_status_upper = new_status.upper()
            if new_status_upper not in reservation_status.__members__:
                return jsonify({
                    "error": f"Estado inválido. Usa uno de: {[s.name for s in reservation_status]}"
                }), 400
            reserva.status = reservation_status[new_status_upper]

        if data.get('start_date_time'):
            try:
                reserva.start_date_time = datetime.strptime(data['start_date_time'], "%Y-%m-%d %H:%M:%S")
            except ValueError:
                return jsonify({"error": "Formato de fecha inválido. Usa YYYY-MM-DD HH:MM:SS"}), 400

        if reserva.table_id:
            table = db.session.get(Table, reserva.table_id)
            if table:
                if reserva.status == reservation_status.CONFIRMADA:
                    table.status = table_status.RESERVADA
                elif reserva.status == reservation_status.PENDIENTE:
                    table.status = table_status.OCUPADA
                elif reserva.status in [reservation_status.COMPLETADA, reservation_status.CANCELADA]:
                    table.status = table_status.LIBRE

        db.session.commit()
        return jsonify({"message": "Reserva actualizada correctamente"}), 200

    except Exception as e:
        db.session.rollback()
        print("Error al actualizar la reserva:", e)
        return jsonify({"error": "Ocurrió un error al actualizar la reserva"}), 500

@api.route('/reservations/<int:id>', methods=['DELETE'])
def delete_reservation(id):
    try:
        reserva = Reservation.query.get(id)

        if not reserva:
            return jsonify({"error": "Reserva no encontrada"}), 404

        if reserva.table_id:
            table = db.session.get(Table, reserva.table_id)
            if table:
                table.status = table_status.LIBRE

        db.session.delete(reserva)
        db.session.commit()

        return jsonify({"message": "Reserva eliminada correctamente"}), 200

    except Exception as e:
        db.session.rollback()
        print("Error al eliminar la reserva:", e)
        return jsonify({"error": "Ocurrió un error al eliminar la reserva"}), 500 