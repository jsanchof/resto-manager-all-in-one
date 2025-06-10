from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt
from src.api.models import Order, order_status
from src.api import db
from src.api.utils import create_api_response
from . import api
from sqlalchemy import select, func


def kitchen_required(f):
    @jwt_required()
    def decorated_function(*args, **kwargs):
        claims = get_jwt()
        if claims.get("role") != "KITCHEN":
            return create_api_response(
                error="Access denied. Kitchen staff only.", status_code=403
            )
        return f(*args, **kwargs)

    return decorated_function


@api.route("/kitchen/orders", methods=["GET"])
@kitchen_required
def get_kitchen_orders():
    try:
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 10))
        status_filter = request.args.get("status", "").upper()

        # Build base query
        query = Order.query

        # Apply status filter if provided
        if status_filter and status_filter in order_status.__members__:
            query = query.filter(Order.status == order_status[status_filter])

        # Get total count for pagination
        total = query.count()

        # Apply pagination
        orders = (
            query.order_by(Order.created_at.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
            .all()
        )

        return create_api_response(
            data={
                "items": [order.serialize() for order in orders],
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "total": total,
                    "pages": (total + per_page - 1) // per_page,
                },
            },
            message="Kitchen orders retrieved successfully",
        )

    except ValueError as e:
        return create_api_response(
            error="Invalid pagination parameters", status_code=400
        )
    except Exception as e:
        print("Error getting kitchen orders:", e)
        return create_api_response(error=str(e), status_code=500)


@api.route("/kitchen/orders/<int:id>", methods=["PUT"])
@kitchen_required
def update_order_status(id):
    try:
        data = request.get_json()
        order = Order.query.get(id)

        if not order:
            return create_api_response(error="Order not found", status_code=404)

        new_status_str = data.get("status", "").upper()
        if new_status_str not in order_status.__members__:
            return create_api_response(
                error=f"Invalid status. Use one of: {[s.name for s in order_status]}",
                status_code=400,
            )

        current_status = order.status
        new_status = order_status[new_status_str]

        # Define allowed status transitions for kitchen staff
        allowed_transitions = {
            order_status.PENDING: [order_status.IN_PROGRESS],
            order_status.IN_PROGRESS: [order_status.READY],
            order_status.READY: [order_status.IN_PROGRESS],  # Allow reverting if needed
        }

        if new_status not in allowed_transitions.get(current_status, []):
            return create_api_response(
                error="Status transition not allowed for kitchen staff", status_code=403
            )

        order.status = new_status
        db.session.commit()

        return create_api_response(
            data=order.serialize(), message="Order status updated successfully"
        )

    except Exception as e:
        db.session.rollback()
        print("Error updating order status:", e)
        return create_api_response(error=str(e), status_code=500)


@api.route("/kitchen/orders/pending/count", methods=["GET"])
@kitchen_required
def get_pending_orders_count():
    try:
        # Count orders that are either pending or in progress
        stmt = (
            select(func.count())
            .select_from(Order)
            .where(Order.status.in_([order_status.PENDING, order_status.IN_PROGRESS]))
        )
        count = db.session.scalar(stmt)

        return create_api_response(
            data={"count": count or 0},
            message="Pending orders count retrieved successfully",
        )

    except Exception as e:
        print("Error getting pending orders count:", e)
        return create_api_response(error=str(e), status_code=500)
