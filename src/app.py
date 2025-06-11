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


def create_app(config_name=None):
    """
    Application factory for creating Flask app instances.
    Supports different configurations for testing, development, etc.
    """
    app = Flask(__name__)

    # Environment configuration
    ENV = os.getenv("FLASK_ENV", "development")
    if config_name:
        ENV = config_name
    DEBUG = ENV == "development"

    # JWT configuration
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "da_secre_qi")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
    jwt.init_app(app)
    cors.init_app(app)
    bcrypt.init_app(app)
    app.url_map.strict_slashes = False

    # Static files configuration
    static_file_dir = os.path.join(
        os.path.dirname(os.path.realpath(__file__)), "../public/"
    )

    # Database configuration
    if ENV == "test":
        default_db_url = (
            "postgresql://postgres:admin1234@localhost:5432/restaurant_test"
        )
    else:
        default_db_url = "postgresql://postgres:admin1234@localhost:5432/restaurant"

    db_url = os.getenv("DATABASE_URL", default_db_url)
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://")

    app.config.update(
        SQLALCHEMY_DATABASE_URI=db_url,
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        SQLALCHEMY_ECHO=DEBUG,
    )

    db.init_app(app)

    # Only reset schema in non-test environments
    with app.app_context():
        if ENV != "test":
            with db.engine.connect() as connection:
                connection.execute(text("DROP SCHEMA public CASCADE;"))
                connection.execute(text("CREATE SCHEMA public;"))
                connection.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
                connection.commit()
        db.create_all()

    # Initialize Flask-Migrate
    Migrate(app, db, compare_type=True)
    setup_admin(app)
    setup_commands(app)
    register_routes(app)

    # Error handler
    @app.errorhandler(APIException)
    def handle_invalid_usage(error):
        return jsonify(error.to_dict()), error.status_code

    # Sitemap
    @app.route("/")
    def sitemap():
        if ENV == "development":
            return generate_sitemap(app)
        return send_from_directory(static_file_dir, "index.html")

    # Serve static files
    @app.route("/<path:path>", methods=["GET"])
    def serve_any_other_file(path):
        if not os.path.isfile(os.path.join(static_file_dir, path)):
            path = "index.html"
        response = send_from_directory(static_file_dir, path)
        response.cache_control.max_age = 0
        return response

    return app


# this only runs if `$ python src/main.py` is executed
if __name__ == "__main__":
    PORT = int(os.environ.get("PORT", 3001))
    app.run(host="0.0.0.0", port=PORT, debug=True)
