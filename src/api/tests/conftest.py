import pytest
from flask import Flask
from app import create_app
from models import db
from flask_jwt_extended import create_access_token


@pytest.fixture
def app():
    app = create_app("testing")
    app.config.update(
        {
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "postgresql://postgres:admin1234@localhost:5432/restaurant_test",
        }
    )

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_headers():
    token = create_access_token(identity=1)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    return headers
