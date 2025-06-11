import pytest
from src.api.models import User


def test_register_success(test_client, session):
    """Test successful user registration."""
    response = test_client.post(
        "/api/auth/register",
        json={
            "email": "newuser@test.com",
            "password": "test123",
            "name": "New",
            "last_name": "User",
            "phone_number": "1234567890",
            "role": "CLIENTE",
        },
    )
    assert response.status_code == 201
    assert response.json["ok"] is True
    assert "Register was successfull" in response.json["msg"]

    # Verify user was created in database
    user = session.query(User).filter_by(email="newuser@test.com").first()
    assert user is not None
    assert user.name == "New"
    assert user.last_name == "User"
    assert user.role.value == "CLIENTE"


def test_register_duplicate_email(test_client, test_client_user):
    """Test registration with duplicate email fails."""
    response = test_client.post(
        "/api/auth/register",
        json={
            "email": "client@test.com",  # Email already used by test_client_user
            "password": "test123",
            "name": "Another",
            "last_name": "User",
            "phone_number": "1234567890",
            "role": "CLIENTE",
        },
    )
    assert response.status_code == 409
    assert "User already exists" in response.json["msg"]


def test_login_success(test_client, test_client_user):
    """Test successful login."""
    response = test_client.post(
        "/api/auth/login",
        json={
            "email": "client@test.com",
            "password": "test123",
        },
    )
    assert response.status_code == 200
    assert "access_token" in response.json
    assert response.json["user"]["email"] == "client@test.com"
    assert response.json["user"]["role"] == "CLIENTE"


def test_login_invalid_credentials(test_client):
    """Test login with invalid credentials."""
    response = test_client.post(
        "/api/auth/login",
        json={
            "email": "nonexistent@test.com",
            "password": "wrongpass",
        },
    )
    assert response.status_code == 401
    assert "Invalid credentials" in response.json["msg"]


def test_protected_route_no_token(test_client):
    """Test accessing protected route without token."""
    response = test_client.get("/api/auth/profile")
    assert response.status_code == 401
    assert "Missing" in response.json["msg"]


def test_protected_route_with_token(test_client, test_client_user):
    """Test accessing protected route with valid token."""
    # First login to get token
    login_response = test_client.post(
        "/api/auth/login",
        json={
            "email": "client@test.com",
            "password": "test123",
        },
    )
    token = login_response.json["access_token"]

    # Use token to access protected route
    response = test_client.get(
        "/api/auth/profile",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json["email"] == "client@test.com"