from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload
from src.api import db
from src.api.models import Order, OrderDetail, order_status, User
from src.api.utils import create_api_response, create_paginated_response
from flask import Blueprint
orders_api = Blueprint("orders_api", __name__)
from datetime import datetime


@orders_api.route("/orders", methods=["GET"])
@jwt_required()
def get_orders():
    try:
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 10))
        search = request.args.get("search", "").strip()
        status_filter = request.args.get("status", "").upper().strip()

        stmt = select(Order).options(
            joinedload(Order.user),
            joinedload(Order.items).joinedload(OrderDetail.product),
        )

        if search:
            stmt = stmt.join(Order.user).where(User.email.ilike(f"%{search}%"))

        if status_filter:
            if status_filter in order_status.__members__:
                stmt = stmt.where(Order.status == order_status[status_filter])
            else:
                return create_api_response(
                    error=f"Invalid status. Use one of: {[s.name for s in order_status]}",
                    status_code=400,
                )

        total = db.session.scalar(select(func.count()).select_from(stmt.subquery()))
        stmt = (
            stmt.order_by(Order.created_at.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
        )
        orders = db.session.scalars(stmt).unique().all()

        return create_paginated_response(
            items=[order.serialize() for order in orders],
            total=total,
            page=page,
            per_page=per_page,
            message="Orders retrieved successfully",
        )

    except ValueError as e:
        return create_api_response(
            error="Invalid pagination parameters", status_code=400
        )
    except Exception as e:
        print("Error in GET /orders:", e)
        return create_api_response(error=str(e), status_code=500)


@orders_api.route("/orders", methods=["POST"])
@jwt_required()
def create_order():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()

        if not data.get("products"):
            return create_api_response(error="No products provided", status_code=400)

        # Generate a unique order code
        order_code = f"ORD{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

        new_order = Order(
            order_code=order_code,
            user_id=current_user_id,
            creator_id=current_user_id,
            table_id=data.get("table_id"),
            status=order_status.PENDING,
            total=0,
            take_away=data.get("take_away", False),  # New field for take-away orders
        )

        db.session.add(new_order)
        db.session.flush()

        total = 0
        items = []

        for product_item in data.get("products", []):
            item = OrderDetail(
                order_id=new_order.id,
                product_id=product_item["id"],
                quantity=product_item.get("quantity", 1),
                price=product_item["price"],
            )
            total += item.price * item.quantity
            items.append(item)

        new_order.total = total
        db.session.add_all(items)
        db.session.commit()

        return create_api_response(
            data=new_order.serialize(),
            message="Order created successfully",
            status_code=201,
        )

    except KeyError as e:
        return create_api_response(
            error=f"Missing required field: {str(e)}", status_code=400
        )
    except Exception as e:
        db.session.rollback()
        print("Error creating order:", e)
        return create_api_response(error=str(e), status_code=500)


@orders_api.route("/orders/<int:id>", methods=["GET"])
@jwt_required()
def get_order(id):
    try:
        order = Order.query.get(id)
        if not order:
            return create_api_response(error="Order not found", status_code=404)

        return create_api_response(
            data=order.serialize(), message="Order retrieved successfully"
        )

    except Exception as e:
        return create_api_response(error=str(e), status_code=500)


@orders_api.route("/orders/<int:id>", methods=["PUT"])
@jwt_required()
def update_order(id):
    try:
        data = request.get_json()
        order = Order.query.get(id)

        if not order:
            return create_api_response(error="Order not found", status_code=404)

        status_str = data.get("status", "").upper()
        if status_str not in order_status.__members__:
            return create_api_response(
                error=f"Invalid status. Use one of: {[s.name for s in order_status]}",
                status_code=400,
            )

        order.status = order_status[status_str]
        if data.get("take_away") is not None:
            order.take_away = data["take_away"]

        db.session.commit()

        return create_api_response(
            data=order.serialize(), message="Order updated successfully"
        )

    except Exception as e:
        db.session.rollback()
        return create_api_response(error=str(e), status_code=500)


@orders_api.route("/orders/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_order(id):
    try:
        order = Order.query.get(id)
        if not order:
            return create_api_response(error="Order not found", status_code=404)

        db.session.delete(order)
        db.session.commit()

        return create_api_response(message="Order deleted successfully")

    except Exception as e:
        db.session.rollback()
        return create_api_response(error=str(e), status_code=500)


@orders_api.route("/orders/user", methods=["GET"])
@jwt_required()
def get_user_orders():
    try:
        user_id = get_jwt_identity()
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 10))
        status_filter = request.args.get("status", "").upper().strip()

        stmt = (
            select(Order)
            .options(joinedload(Order.items).joinedload(OrderDetail.product))
            .where(Order.user_id == user_id)
        )

        if status_filter and status_filter != "ALL":
            if status_filter in order_status.__members__:
                stmt = stmt.where(Order.status == order_status[status_filter])
            else:
                return create_api_response(
                    error=f"Invalid status. Use one of: {[s.name for s in order_status]}",
                    status_code=400,
                )

        total = db.session.scalar(select(func.count()).select_from(stmt.subquery()))
        stmt = (
            stmt.order_by(Order.created_at.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
        )
        orders = db.session.scalars(stmt).unique().all()

        return create_paginated_response(
            items=[order.serialize() for order in orders],
            total=total,
            page=page,
            per_page=per_page,
            message="User orders retrieved successfully",
        )

    except ValueError as e:
        return create_api_response(
            error="Invalid pagination parameters", status_code=400
        )
    except Exception as e:
        return create_api_response(error=str(e), status_code=500)
