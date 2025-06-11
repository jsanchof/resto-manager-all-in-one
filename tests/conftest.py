import os
import pytest
from src.app import app as flask_app
from src.api import db as _db
from src.api.models import User, user_role


@pytest.fixture(scope="session")
def app():
    """Create and configure a test Flask application instance."""
    flask_app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": os.getenv(
            "DATABASE_URL",
            "postgresql://postgres:admin1234@localhost:5432/restaurant_test"
        ),
        "SQLALCHEMY_TRACK_MODIFICATIONS": False,
        "JWT_SECRET_KEY": "test_secret_key",
    })

    with flask_app.app_context():
        _db.create_all()
        yield flask_app
        _db.session.remove()
        _db.drop_all()


@pytest.fixture(scope="session")
def db(app):
    """Create and configure a test database."""
    return _db


@pytest.fixture(scope="function")
def session(db):
    """Create a new database session for a test."""
    connection = db.engine.connect()
    transaction = connection.begin()
    session = db.create_scoped_session()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def test_client(app):
    """Create a test client for the app."""
    return app.test_client()


@pytest.fixture
def test_admin_user(session):
    """Create a test admin user."""
    user = User(
        email="admin@test.com",
        password="test123",
        name="Admin",
        last_name="User",
        role=user_role.ADMIN,
        is_active=True,
    )
    session.add(user)
    session.commit()
    return user


@pytest.fixture
def test_waiter_user(session):
    """Create a test waiter user."""
    user = User(
        email="waiter@test.com",
        password="test123",
        name="Waiter",
        last_name="User",
        role=user_role.MESERO,
        is_active=True,
    )
    session.add(user)
    session.commit()
    return user


@pytest.fixture
def test_client_user(session):
    """Create a test client user."""
    user = User(
        email="client@test.com",
        password="test123",
        name="Client",
        last_name="User",
        role=user_role.CLIENTE,
        is_active=True,
    )
    session.add(user)
    session.commit()
    return user