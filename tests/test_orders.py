import pytest
from src.api.models import Order, Table, Product, order_status, table_status, dish_type


def test_create_order(test_client, test_waiter_user, session):
    """Test creating a new order as a waiter."""
    # First login as waiter to get token
    login_response = test_client.post(
        "/api/auth/login",
        json={
            "email": "waiter@test.com",
            "password": "test123",
        },
    )
    token = login_response.json["access_token"]

    # Create a table and product for the order
    table = Table(number=1, capacity=4, status=table_status.FREE)
    session.add(table)

    product = Product(
        name="Test Dish",
        description="A test dish",
        price=15.99,
        type=dish_type.PLATO_PRINCIPAL,
        is_active=True,
    )
    session.add(product)
    session.commit()

    # Create order
    response = test_client.post(
        "/api/waiter/orders",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "table_id": table.id,
            "items": [
                {"product_id": product.id, "quantity": 2}
            ],
        },
    )

    assert response.status_code == 201
    assert "Order created successfully" in response.json["message"]
    
    # Verify order in database
    order = session.query(Order).first()
    assert order is not None
    assert order.table_id == table.id
    assert order.status == order_status.PENDING
    assert len(order.items) == 1
    assert order.items[0].quantity == 2
    assert order.total == product.price * 2


def test_get_waiter_orders(test_client, test_waiter_user, session):
    """Test retrieving orders as a waiter."""
    # Login as waiter
    login_response = test_client.post(
        "/api/auth/login",
        json={
            "email": "waiter@test.com",
            "password": "test123",
        },
    )
    token = login_response.json["access_token"]

    # Create some test orders
    table = Table(number=1, capacity=4, status=table_status.OCCUPIED)
    session.add(table)
    session.commit()

    order1 = Order(
        user_id=test_waiter_user.id,
        creator_id=test_waiter_user.id,
        table_id=table.id,
        status=order_status.PENDING,
        total=25.98,
    )
    order2 = Order(
        user_id=test_waiter_user.id,
        creator_id=test_waiter_user.id,
        table_id=table.id,
        status=order_status.IN_PROGRESS,
        total=31.97,
    )
    session.add_all([order1, order2])
    session.commit()

    # Get orders
    response = test_client.get(
        "/api/waiter/orders",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json["total"] == 2
    assert len(response.json["items"]) == 2


def test_unauthorized_access(test_client, test_client_user):
    """Test that non-waiter users cannot access waiter endpoints."""
    # Login as regular client
    login_response = test_client.post(
        "/api/auth/login",
        json={
            "email": "client@test.com",
            "password": "test123",
        },
    )
    token = login_response.json["access_token"]

    # Try to access waiter endpoint
    response = test_client.get(
        "/api/waiter/orders",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 403
    assert "Waiter staff privileges required" in response.json["error"]
