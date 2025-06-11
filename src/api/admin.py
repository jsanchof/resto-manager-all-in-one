import os
from flask_admin import Admin
from src.api import db
from src.api.models import (
    User,
    Dish,
    dish_type,
    Drink,
    Product,
    Order,
    OrderDetail,
)
from flask_admin.contrib.sqla import ModelView


def setup_admin(app):
    app.secret_key = os.environ.get("FLASK_APP_KEY", "sample key")
    app.config["FLASK_ADMIN_SWATCH"] = "cerulean"
    admin = Admin(app, name="Restaurant Admin", template_mode="bootstrap3")

    # Add your models here, for example this is how we add a the User model to the admin
    admin.add_view(ModelView(User, db.session))

    # You can duplicate that line to add mew models
    # admin.add_view(ModelView(YourModelName, db.session))
    admin.add_view(ModelView(Dish, db.session))
    admin.add_view(ModelView(Drink, db.session))
    admin.add_view(ModelView(Product, db.session))
    admin.add_view(ModelView(Order, db.session))
    admin.add_view(ModelView(OrderDetail, db.session))
