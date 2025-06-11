"""
Admin routes for restaurant management.
"""

from flask import Blueprint, jsonify, request
from src.api import db
from src.api.models import (
    Product,
    Order,
    OrderDetail,
    Dish,
    Drink,
    order_status,
    User,
)
from datetime import datetime, timedelta
from sqlalchemy import func
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.orm import joinedload

admin_api = Blueprint("admin_api", __name__)


# Admin Authentication Check
def admin_required(f):
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(email=current_user_id).first()
        if not user or user.role != "ADMIN":
            return jsonify({"error": "Admin privileges required"}), 403
        return f(*args, **kwargs)

    wrapper.__name__ = f.__name__
    return jwt_required()(wrapper)


# Analytics Routes
@admin_api.route("/analytics/sales", methods=["GET"])
@admin_required
def get_sales_analytics():
    # Get sales data for the last 30 days
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30)

    sales_data = (
        db.session.query(
            func.date(Order.created_at).label("date"),
            func.count(Order.id).label("orders"),
            func.sum(Order.total).label("sales"),
        )
        .filter(Order.created_at.between(start_date, end_date))
        .group_by(func.date(Order.created_at))
        .all()
    )

    return jsonify(
        [
            {
                "date": str(data.date),
                "orders": data.orders,
                "sales": float(data.sales) if data.sales else 0,
            }
            for data in sales_data
        ]
    )


@admin_api.route("/analytics/stats", methods=["GET"])
@admin_required
def get_stats():
    total_orders = Order.query.count()
    total_revenue = db.session.query(func.sum(Order.total)).scalar() or 0
    average_order = total_revenue / total_orders if total_orders > 0 else 0
    total_products = Product.query.count()

    return jsonify(
        {
            "totalOrders": total_orders,
            "totalRevenue": float(total_revenue),
            "averageOrderValue": float(average_order),
            "totalProducts": total_products,
        }
    )


# Order Management Routes
@admin_api.route("/orders", methods=["GET"])
@admin_required
def get_all_orders():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    status = request.args.get("status")
    has_beverages = request.args.get("has_beverages", type=bool)

    query = Order.query.options(
        joinedload(Order.user),
        joinedload(Order.items).joinedload(OrderDetail.product),
    )

    if status:
        query = query.filter(Order.status == status)

    if has_beverages is not None:
        query = query.filter(Order.has_beverages == has_beverages)

    orders = query.order_by(Order.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify(
        {
            "items": [order.to_dict() for order in orders.items],
            "total": orders.total,
            "pages": orders.pages,
            "current_page": orders.page,
        }
    )


@admin_api.route("/orders/<int:id>", methods=["PUT"])
@admin_required
def admin_update_order(id):
    order = Order.query.get_or_404(id)
    data = request.get_json()

    if "status" in data:
        order.status = data["status"]

    if "has_beverages" in data:
        order.has_beverages = data["has_beverages"]

    if "items" in data:
        # Remove existing items
        OrderDetail.query.filter_by(order_id=order.id).delete()

        # Add new items
        total = 0
        has_beverages = False
        for item_data in data["items"]:
            product = Product.query.get(item_data["product_id"])
            if product and product.type == "BEBIDA":
                has_beverages = True

            item = OrderDetail(
                order_id=order.id,
                product_id=item_data["product_id"],
                quantity=item_data["quantity"],
                price=item_data["price"],
            )
            total += item.price * item.quantity
            db.session.add(item)

        order.total = total
        order.has_beverages = has_beverages

    db.session.commit()
    return jsonify(order.to_dict())


@admin_api.route("/orders/<int:id>", methods=["DELETE"])
@admin_required
def admin_delete_order(id):
    order = Order.query.get_or_404(id)

    # Free up the table if the order is being deleted
    if order.table:
        order.table.status = "LIBRE"

    db.session.delete(order)
    db.session.commit()
    return "", 204


# Bar Orders Route
@admin_api.route("/bar/orders", methods=["GET"])
@admin_required
def get_bar_orders():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    # Get orders that have beverages and are in PENDIENTE or EN_PROCESO status
    query = Order.query.filter(
        Order.has_beverages.is_(True),
        Order.status.in_([order_status.PENDIENTE, order_status.EN_PROCESO]),
    ).options(
        joinedload(Order.user),
        joinedload(Order.items).joinedload(OrderDetail.product),
    )

    orders = query.order_by(Order.created_at.asc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify(
        {
            "items": [order.to_dict() for order in orders.items],
            "total": orders.total,
            "pages": orders.pages,
            "current_page": orders.page,
        }
    )


# Products Routes (Dishes and Drinks)
@admin_api.route("/dishes", methods=["GET"])
@admin_required
def get_dishes():
    dishes = db.session.query(Product).join(Dish).all()
    return jsonify([dish.serialize() for dish in dishes])


@admin_api.route("/drinks", methods=["GET"])
@admin_required
def get_drinks():
    drinks = db.session.query(Product).join(Drink).all()
    return jsonify([drink.serialize() for drink in drinks])


@admin_api.route("/dishes", methods=["POST"])
@admin_required
def create_dish():
    data = request.get_json()

    # Create product first
    product = Product(
        name=data["name"],
        description=data.get("description"),
        price=data["price"],
        image_url=data.get("image_url"),
        category=data.get("category", "main"),
        available=data.get("available", True),
    )
    db.session.add(product)
    db.session.flush()  # Get the product ID

    # Create dish
    dish = Dish(product_id=product.id)
    db.session.add(dish)

    # Add ingredients if provided
    if "ingredients" in data:
        for ing_data in data["ingredients"]:
            product_ingredient = ProductIngredient(
                product_id=product.id,
                ingredient_id=ing_data["ingredient_id"],
                quantity=ing_data["quantity"],
            )
            db.session.add(product_ingredient)

    db.session.commit()
    return jsonify(product.serialize()), 201


@admin_api.route("/drinks", methods=["POST"])
@admin_required
def create_drink():
    data = request.get_json()

    # Create product first
    product = Product(
        name=data["name"],
        description=data.get("description"),
        price=data["price"],
        image_url=data.get("image_url"),
        category="drink",
        available=data.get("available", True),
    )
    db.session.add(product)
    db.session.flush()  # Get the product ID

    # Create drink
    drink = Drink(product_id=product.id)
    db.session.add(drink)

    # Add ingredients if provided
    if "ingredients" in data:
        for ing_data in data["ingredients"]:
            product_ingredient = ProductIngredient(
                product_id=product.id,
                ingredient_id=ing_data["ingredient_id"],
                quantity=ing_data["quantity"],
            )
            db.session.add(product_ingredient)

    db.session.commit()
    return jsonify(product.serialize()), 201


@admin_api.route("/products/<int:id>", methods=["PUT"])
@admin_required
def update_product(id):
    product = Product.query.get_or_404(id)
    data = request.get_json()

    # Update product fields
    product.name = data.get("name", product.name)
    product.description = data.get("description", product.description)
    product.price = data.get("price", product.price)
    product.image_url = data.get("image_url", product.image_url)
    product.category = data.get("category", product.category)
    product.available = data.get("available", product.available)

    # Update ingredients if provided
    if "ingredients" in data:
        # Remove existing ingredients
        ProductIngredient.query.filter_by(product_id=product.id).delete()

        # Add new ingredients
        for ing_data in data["ingredients"]:
            product_ingredient = ProductIngredient(
                product_id=product.id,
                ingredient_id=ing_data["ingredient_id"],
                quantity=ing_data["quantity"],
            )
            db.session.add(product_ingredient)

    db.session.commit()
    return jsonify(product.serialize())


@admin_api.route("/products/<int:id>", methods=["DELETE"])
@admin_required
def delete_product(id):
    product = Product.query.get_or_404(id)

    # Delete associated dish or drink
    Dish.query.filter_by(product_id=id).delete()
    Drink.query.filter_by(product_id=id).delete()

    # Delete product and its ingredients
    ProductIngredient.query.filter_by(product_id=id).delete()
    db.session.delete(product)
    db.session.commit()
    return "", 204


# Ingredients Routes
@admin_api.route("/ingredients", methods=["GET"])
@admin_required
def get_ingredients():
    ingredients = Ingredient.query.all()
    return jsonify([ingredient.serialize() for ingredient in ingredients])


@admin_api.route("/ingredients/low-stock", methods=["GET"])
@admin_required
def get_low_stock_ingredients():
    ingredients = Ingredient.query.filter(
        Ingredient.stock <= Ingredient.minimum_stock
    ).all()
    return jsonify([ingredient.serialize() for ingredient in ingredients])


@admin_api.route("/ingredients", methods=["POST"])
@admin_required
def create_ingredient():
    data = request.get_json()
    ingredient = Ingredient(
        name=data["name"],
        stock=data["stock"],
        unit=data["unit"],
        minimum_stock=data.get("minimum_stock", 0),
    )
    db.session.add(ingredient)
    db.session.commit()
    return jsonify(ingredient.serialize()), 201


@admin_api.route("/ingredients/<int:id>", methods=["PUT"])
@admin_required
def update_ingredient(id):
    ingredient = Ingredient.query.get_or_404(id)
    data = request.get_json()

    ingredient.name = data.get("name", ingredient.name)
    ingredient.stock = data.get("stock", ingredient.stock)
    ingredient.unit = data.get("unit", ingredient.unit)
    ingredient.minimum_stock = data.get("minimum_stock", ingredient.minimum_stock)

    db.session.commit()
    return jsonify(ingredient.serialize())


@admin_api.route("/ingredients/<int:id>", methods=["DELETE"])
@admin_required
def delete_ingredient(id):
    ingredient = Ingredient.query.get_or_404(id)
    db.session.delete(ingredient)
    db.session.commit()
    return "", 204


# Product Ingredients Management
@admin_api.route("/products/<int:product_id>/ingredients", methods=["GET"])
@admin_required
def get_product_ingredients(product_id):
    product = Product.query.get_or_404(product_id)
    ingredients = ProductIngredient.query.filter_by(product_id=product_id).all()
    return jsonify([ing.serialize() for ing in ingredients])


@admin_api.route("/products/<int:product_id>/ingredients", methods=["POST"])
@admin_required
def add_product_ingredients(product_id):
    data = request.get_json()
    ingredients_data = data.get("ingredients", [])

    # Remove existing ingredients
    ProductIngredient.query.filter_by(product_id=product_id).delete()

    # Add new ingredients
    for ing_data in ingredients_data:
        product_ingredient = ProductIngredient(
            product_id=product_id,
            ingredient_id=ing_data["ingredient_id"],
            quantity=ing_data["quantity"],
        )
        db.session.add(product_ingredient)

    db.session.commit()
    return jsonify(
        {
            "message": "Ingredients updated successfully",
            "product_id": product_id,
        }
    )


# Top Selling Products
@admin_api.route("/products/top-selling", methods=["GET"])
def get_top_selling_products():
    top_products = (
        db.session.query(
            Product,
            func.count(OrderDetail.id).label("total_sold"),
            func.sum(OrderDetail.quantity * OrderDetail.price).label("total_revenue"),
        )
        .join(OrderDetail)
        .group_by(Product.id)
        .order_by(func.count(OrderDetail.id).desc())
        .limit(5)
        .all()
    )

    return jsonify(
        [
            {
                "id": product.id,
                "name": product.name,
                "total_sold": total_sold,
                "total_revenue": float(total_revenue),
            }
            for product, total_sold, total_revenue in top_products
        ]
    )
