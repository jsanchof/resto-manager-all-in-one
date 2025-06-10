from flask import request, jsonify
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload
from src.api import db
from src.api.models import Order, OrderItem, order_status, User, Table, table_status, Product
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import api
from datetime import datetime

# Waiter Authentication Check
def waiter_required(f):
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(email=current_user_id).first()
        if not user or user.role != "MESERO":
            return jsonify({"error": "Waiter staff privileges required"}), 403
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return jwt_required()(wrapper)

@api.route('/waiter/orders', methods=['GET'])
@waiter_required
def get_waiter_orders():
    try:
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 10))
        
        # Build base query with necessary joins
        stmt = select(Order).options(
            joinedload(Order.user),
            joinedload(Order.items),
            joinedload(Order.table)
        )

        total = db.session.scalar(select(func.count()).select_from(stmt.subquery()))
        
        stmt = stmt.order_by(Order.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
        orders = db.session.scalars(stmt).unique().all()

        return jsonify({
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": (total + per_page - 1) // per_page,
            "items": [order.serialize() for order in orders]
        }), 200

    except Exception as e:
        print("Error in GET /waiter/orders:", e)
        return jsonify({"error": str(e)}), 500

@api.route('/waiter/orders', methods=['POST'])
@waiter_required
def create_waiter_order():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()

        # Validate table
        table_id = data.get('table_id')
        if not table_id:
            return jsonify({"error": "Table ID is required"}), 400

        table = Table.query.get(table_id)
        if not table:
            return jsonify({"error": "Table not found"}), 404

        if table.status != table_status.FREE:
            return jsonify({"error": "Table is not available"}), 400

        # Create order
        new_order = Order(
            user_id=current_user_id,
            creator_id=current_user_id,
            table_id=table_id,
            status=order_status.PENDING,
            total=0
        )

        # Process items and check for beverages
        items = []
        total = 0
        has_beverages = False

        for item_data in data.get('items', []):
            product = Product.query.get(item_data['product_id'])
            if not product:
                return jsonify({"error": f"Product {item_data['product_id']} not found"}), 404

            # Check if any product is a beverage
            if product.type == 'DRINK':
                has_beverages = True

            item = OrderItem(
                product_id=product.id,
                quantity=item_data.get('quantity', 1),
                price=product.price
            )
            total += item.price * item.quantity
            items.append(item)

        if not items:
            return jsonify({"error": "Order must contain at least one product"}), 400

        new_order.has_beverages = has_beverages
        new_order.total = total
        new_order.items = items

        # Update table status
        table.status = table_status.OCCUPIED

        db.session.add(new_order)
        db.session.commit()

        return jsonify({
            "message": "Order created successfully",
            "order": new_order.serialize()
        }), 201

    except Exception as e:
        db.session.rollback()
        print("Error creating order:", e)
        return jsonify({"error": str(e)}), 500

@api.route('/waiter/tables', methods=['GET'])
@waiter_required
def get_available_tables():
    try:
        tables = Table.query.filter_by(status=table_status.FREE).all()
        return jsonify([table.serialize() for table in tables]), 200

    except Exception as e:
        print("Error getting available tables:", e)
        return jsonify({"error": str(e)}), 500

@api.route('/waiter/orders/<int:id>/pay', methods=['PUT'])
@waiter_required
def mark_order_paid(id):
    try:
        order = Order.query.get(id)
        if not order:
            return create_api_response(error="Order not found", status_code=404)

        if order.status != order_status.READY:
            return create_api_response(
                error="Only orders that are ready can be marked as paid",
                status_code=400
            )

        # Free up the table
        table = order.table
        if table:
            table.status = table_status.AVAILABLE

        # Mark order as delivered (paid)
        order.status = order_status.DELIVERED
        db.session.commit()

        return create_api_response(
            data=order.serialize(),
            message="Order marked as paid and table freed"
        )

    except Exception as e:
        db.session.rollback()
        print("Error marking order as paid:", e)
        return create_api_response(error=str(e), status_code=500) 