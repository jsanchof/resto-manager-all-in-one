"""
This module takes care of starting the API Server, Loading the DB and Adding the
endpoints
"""

import os
from flask import Flask, jsonify, send_from_directory
from flask_migrate import Migrate
from src.api.utils import APIException, generate_sitemap
from src.api import db, bcrypt, jwt, cors
from src.api.admin import setup_admin
from src.api.commands import setup_commands
from src.api.routes import register_routes
from datetime import timedelta
from sqlalchemy import text

# Environment configuration
ENV = os.getenv("FLASK_ENV", "development")
DEBUG = ENV == "development"

app = Flask(__name__)

# JWT configuration
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "da_secre_qi")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
jwt.init_app(app)
cors.init_app(app)
bcrypt.init_app(app)
app.url_map.strict_slashes = False

# Static files configuration
static_file_dir = os.path.join(
    os.path.dirname(os.path.realpath(__file__)), 
    "../public/"
)

# Database configuration
if ENV == "test":
    default_db_url = "postgresql://postgres:admin1234@localhost:5432/restaurant_test"
else:
    default_db_url = "postgresql://postgres:admin1234@localhost:5432/restaurant"

db_url = os.getenv("DATABASE_URL", default_db_url)

# Handle legacy Heroku DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://")

app.config.update(
    SQLALCHEMY_DATABASE_URI=db_url,
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    SQLALCHEMY_ECHO=DEBUG
)

# Initialize SQLAlchemy
db.init_app(app)

# Initialize database
with app.app_context():
    if ENV != "test":  # Don't reset schema in test environment
        # Drop all tables with CASCADE
        with db.engine.connect() as connection:
            connection.execute(text("DROP SCHEMA public CASCADE;"))
            connection.execute(text("CREATE SCHEMA public;"))
            connection.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
            connection.commit()

    # Create all tables
    db.create_all()

# Initialize Flask-Migrate
MIGRATE = Migrate(app, db, compare_type=True)

# add the admin
setup_admin(app)

# add the admin
setup_commands(app)

# Register all routes
register_routes(app)


# Handle/serialize errors like a JSON object
@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code


# generate sitemap with all your endpoints
@app.route("/")
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, "index.html")


# any other endpoint will try to serve it like a static file
@app.route("/<path:path>", methods=["GET"])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = "index.html"
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response


# this only runs if `$ python src/main.py` is executed
if __name__ == "__main__":
    PORT = int(os.environ.get("PORT", 3001))
    app.run(host="0.0.0.0", port=PORT, debug=True)
