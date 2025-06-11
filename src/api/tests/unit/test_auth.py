import json
from src.api.models import User
import os


def test_register(client):
    os.environ["FRONTEND_URL"] = "http://localhost"
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@test.com",
            "password": "test1234",
            "name": "Test",
            "last_name": "User",
            "phone_number": "1234567890",
            "role": "CLIENT",
        },
    )
    assert response.status_code == 201
    data = json.loads(response.data)
    assert "msg" in data
    assert data["msg"] == "Registration successful"


def test_login(client):
    os.environ["FRONTEND_URL"] = "http://localhost"
    # First create a user
    client.post(
        "/api/auth/register",
        json={
            "email": "test@test.com",
            "password": "test1234",
            "name": "Test",
            "last_name": "User",
            "phone_number": "1234567890",
            "role": "CLIENT",
        },
    )

    # Activate the user
    from src.api.models import db, User

    user = db.session.scalar(db.select(User).where(User.email == "test@test.com"))
    user.is_active = True
    db.session.commit()

    # Then try to login
    response = client.post(
        "/api/auth/login", json={"email": "test@test.com", "password": "test1234"}
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "access_token" in data
