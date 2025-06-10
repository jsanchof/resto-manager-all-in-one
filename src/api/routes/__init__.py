from flask import Blueprint, Flask
from flask_cors import CORS

from .admin import admin_api
from .auth import auth
from .general import api as general_api
from .kitchen import api as kitchen_api
from .orders import api as orders_api
from .products import api as products_api
from .public import public
from .reservations import api as reservations_api
from .tables import api as tables_api
from .waiter import api as waiter_api

# Create the main Blueprint
api = Blueprint("api", __name__)

# Allow CORS requests to this API
CORS(api)


def register_routes(app: Flask):
    """Register all blueprints with the app"""
    app.register_blueprint(admin_api, url_prefix="/api/admin")
    app.register_blueprint(auth, url_prefix="/api/auth")
    app.register_blueprint(public, url_prefix="/api")
