from flask import Blueprint, Flask
from flask_cors import CORS
from .admin import admin_api
from .auth import auth
from .public import public

# Create the main Blueprint
api = Blueprint("api", __name__)

# Allow CORS requests to this API
CORS(api)

# Import all route modules
from .reservations import *
from .tables import *
from .orders import *
from .products import *
from .kitchen import *
from .waiter import *
from .general import *

# All routes will be registered to the api Blueprint automatically


def register_routes(app: Flask):
    """Register all blueprints with the app"""
    app.register_blueprint(admin_api, url_prefix="/api/admin")
    app.register_blueprint(auth, url_prefix="/api/auth")
    app.register_blueprint(public, url_prefix="/api")
