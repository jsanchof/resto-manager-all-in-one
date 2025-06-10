from flask import request, jsonify
from src.api import db
from src.api.models import Dishes, Drinks, dish_type, drink_type
from sqlalchemy import select, func, or_
from . import api


@api.route("/productos", methods=["GET"])
def get_productos():
    try:
        # Get pagination parameters
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 10))
        search = request.args.get("search", "").strip()
        tipo = request.args.get("tipo", "").upper().strip()

        # Build base query for dishes
        dishes_stmt = select(Dishes).where(Dishes.is_active == True)
        drinks_stmt = select(Drinks).where(Drinks.is_active == True)

        # Apply search filter if provided
        if search:
            dishes_stmt = dishes_stmt.where(
                or_(
                    Dishes.name.ilike(f"%{search}%"),
                    Dishes.description.ilike(f"%{search}%"),
                )
            )
            drinks_stmt = drinks_stmt.where(
                or_(
                    Drinks.name.ilike(f"%{search}%"),
                    Drinks.description.ilike(f"%{search}%"),
                )
            )

        # Apply type filter if provided
        if tipo == "PLATO":
            drinks_stmt = select(Drinks).where(False)  # Empty drinks query
        elif tipo == "BEBIDA":
            dishes_stmt = select(Dishes).where(False)  # Empty dishes query

        # Execute queries
        dishes = db.session.scalars(dishes_stmt).all()
        drinks = db.session.scalars(drinks_stmt).all()

        # Combine and format results
        items = []

        # Add dishes
        for dish in dishes:
            items.append(
                {
                    "id": f"PLATO-{dish.id}",
                    "name": dish.name,
                    "description": dish.description,
                    "url_img": dish.url_img,
                    "price": dish.price,
                    "tipo": "PLATO",
                    "type": dish.type.value,
                    "is_active": dish.is_active,
                }
            )

        # Add drinks
        for drink in drinks:
            items.append(
                {
                    "id": f"BEBIDA-{drink.id}",
                    "name": drink.name,
                    "description": drink.description,
                    "url_img": drink.url_img,
                    "price": drink.price,
                    "tipo": "BEBIDA",
                    "type": drink.type.value,
                    "is_active": drink.is_active,
                }
            )

        # Calculate total and pagination
        total = len(items)
        total_pages = (total + per_page - 1) // per_page
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_items = items[start_idx:end_idx]

        return (
            jsonify(
                {
                    "total": total,
                    "page": page,
                    "per_page": per_page,
                    "pages": total_pages,
                    "items": paginated_items,
                }
            ),
            200,
        )
    except Exception as e:
        print("Error al obtener productos:", e)
        return jsonify({"error": str(e)}), 500


@api.route("/dishes", methods=["GET"])
def get_dishes():
    try:
        dishes = Dishes.query.all()
        return jsonify([dish.serialize() for dish in dishes]), 200
    except Exception as e:
        print("Error al obtener platos:", e)
        return jsonify({"error": str(e)}), 500


@api.route("/drinks", methods=["GET"])
def get_drinks():
    try:
        drinks = Drinks.query.all()
        return jsonify([drink.serialize() for drink in drinks]), 200
    except Exception as e:
        print("Error al obtener bebidas:", e)
        return jsonify({"error": str(e)}), 500


@api.route("/productos", methods=["POST"])
def crear_producto():
    try:
        data = request.get_json()
        tipo = data.get("tipo", "").upper()

        if tipo == "PLATO":
            tipo_plato = data.get("type", "").upper()
            if tipo_plato not in dish_type.__members__:
                return (
                    jsonify(
                        {
                            "error": f"Tipo de plato inválido. Usa uno de: {[t.name for t in dish_type]}"
                        }
                    ),
                    400,
                )

            nuevo_plato = Dishes(
                name=data["name"],
                description=data["description"],
                price=data["price"],
                type=dish_type[tipo_plato],
                url_img=data.get("url_img"),
            )
            db.session.add(nuevo_plato)
            item = nuevo_plato

        elif tipo == "BEBIDA":
            tipo_bebida = data.get("type", "").upper()
            if tipo_bebida not in drink_type.__members__:
                return (
                    jsonify(
                        {
                            "error": f"Tipo de bebida inválido. Usa uno de: {[t.name for t in drink_type]}"
                        }
                    ),
                    400,
                )

            nueva_bebida = Drinks(
                name=data["name"],
                description=data["description"],
                price=data["price"],
                type=drink_type[tipo_bebida],
                url_img=data.get("url_img"),
            )
            db.session.add(nueva_bebida)
            item = nueva_bebida

        else:
            return (
                jsonify({"error": "Tipo de producto inválido. Usa 'PLATO' o 'BEBIDA'"}),
                400,
            )

        db.session.commit()
        return (
            jsonify(
                {
                    "message": f"{tipo.capitalize()} creado exitosamente",
                    "item": item.serialize(),
                }
            ),
            201,
        )

    except Exception as e:
        db.session.rollback()
        print(f"Error al crear {tipo.lower()}:", e)
        return jsonify({"error": str(e)}), 500


@api.route("/productos/<string:tipo>/<int:id>", methods=["PUT"])
def actualizar_producto(tipo, id):
    try:
        data = request.get_json()
        tipo = tipo.upper()

        if tipo == "PLATO":
            item = Dishes.query.get(id)
            if data.get("type"):
                tipo_plato = data["type"].upper()
                if tipo_plato not in dish_type.__members__:
                    return (
                        jsonify(
                            {
                                "error": f"Tipo de plato inválido. Usa uno de: {[t.name for t in dish_type]}"
                            }
                        ),
                        400,
                    )
                item.type = dish_type[tipo_plato]

        elif tipo == "BEBIDA":
            item = Drinks.query.get(id)
            if data.get("type"):
                tipo_bebida = data["type"].upper()
                if tipo_bebida not in drink_type.__members__:
                    return (
                        jsonify(
                            {
                                "error": f"Tipo de bebida inválido. Usa uno de: {[t.name for t in drink_type]}"
                            }
                        ),
                        400,
                    )
                item.type = drink_type[tipo_bebida]

        else:
            return (
                jsonify({"error": "Tipo de producto inválido. Usa 'PLATO' o 'BEBIDA'"}),
                400,
            )

        if not item:
            return jsonify({"error": f"{tipo.capitalize()} no encontrado"}), 404

        item.name = data.get("name", item.name)
        item.description = data.get("description", item.description)
        item.price = data.get("price", item.price)
        item.url_img = data.get("url_img", item.url_img)

        db.session.commit()
        return (
            jsonify(
                {
                    "message": f"{tipo.capitalize()} actualizado correctamente",
                    "item": item.serialize(),
                }
            ),
            200,
        )

    except Exception as e:
        db.session.rollback()
        print(f"Error al actualizar {tipo.lower()}:", e)
        return jsonify({"error": str(e)}), 500


@api.route("/productos/<string:tipo>/<int:id>", methods=["DELETE"])
def eliminar_producto(tipo, id):
    try:
        tipo = tipo.upper()

        if tipo == "PLATO":
            item = Dishes.query.get(id)
        elif tipo == "BEBIDA":
            item = Drinks.query.get(id)
        else:
            return (
                jsonify({"error": "Tipo de producto inválido. Usa 'PLATO' o 'BEBIDA'"}),
                400,
            )

        if not item:
            return jsonify({"error": f"{tipo.capitalize()} no encontrado"}), 404

        db.session.delete(item)
        db.session.commit()

        return jsonify({"message": f"{tipo.capitalize()} eliminado correctamente"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error al eliminar {tipo.lower()}:", e)
        return jsonify({"error": str(e)}), 500
