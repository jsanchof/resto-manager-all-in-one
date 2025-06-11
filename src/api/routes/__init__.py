from flask import Blueprint, Flask
from flask_cors import CORS

from .admin import admin_api
from .auth import auth_api
from .general import general_api
from .kitchen import kitchen_api
from .orders import orders_api
from .products import products_api
from .public import public_api
from .reservations import reservations_api
from .tables import tables_api
from .waiter import waiter_api

# Create the main Blueprint
api = Blueprint("api", __name__)

# Allow CORS requests to this API
CORS(api)


def register_routes(app: Flask):
    """Register all blueprints with the app"""
    app.register_blueprint(admin_api, url_prefix="/api/admin")
    app.register_blueprint(auth_api, url_prefix="/api/auth")
    app.register_blueprint(general_api, url_prefix="/api/general")
    app.register_blueprint(kitchen_api, url_prefix="/api/kitchen")
    app.register_blueprint(orders_api, url_prefix="/api/orders")
    app.register_blueprint(products_api, url_prefix="/api/products")
    app.register_blueprint(public_api, url_prefix="/api/public")
    app.register_blueprint(reservations_api, url_prefix="/api/reservations")
    app.register_blueprint(tables_api, url_prefix="/api/tables")
    app.register_blueprint(waiter_api, url_prefix="/api/waiter")
