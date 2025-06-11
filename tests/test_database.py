import pytest
from src.api.models import User, Order, Table, Product, dish_type, user_role, order_status, table_status


def test_create_user(session):
    """Test user creation and retrieval."""
    user = User(
        email="test@example.com",
        password="test123",
        name="Test",
        last_name="User",
        role=user_role.CLIENTE,
        is_active=True,
    )
    session.add(user)
    session.commit()

    retrieved_user = session.query(User).filter_by(email="test@example.com").first()
    assert retrieved_user is not None
    assert retrieved_user.name == "Test"
    assert retrieved_user.role == user_role.CLIENTE


def test_create_product(session):
    """Test product creation and retrieval."""
    product = Product(
        name="Test Product",
        description="A test product",
        price=10.99,
        type=dish_type.ENTRADA,
        is_active=True,
    )
    session.add(product)
    session.commit()

    retrieved_product = session.query(Product).filter_by(name="Test Product").first()
    assert retrieved_product is not None
    assert retrieved_product.price == 10.99
    assert retrieved_product.type == dish_type.ENTRADA


def test_create_table(session):
    """Test table creation and status updates."""
    table = Table(
        number=1,
        capacity=4,
        status=table_status.FREE,
    )
    session.add(table)
    session.commit()

    retrieved_table = session.query(Table).filter_by(number=1).first()
    assert retrieved_table is not None
    assert retrieved_table.capacity == 4
    assert retrieved_table.status == table_status.FREE

    # Test status update
    retrieved_table.status = table_status.OCCUPIED
    session.commit()

    updated_table = session.query(Table).filter_by(number=1).first()
    assert updated_table.status == table_status.OCCUPIED


def test_create_order(session, test_client_user, test_waiter_user):
    """Test order creation with relationships."""
    # Create a table
    table = Table(number=1, capacity=4, status=table_status.FREE)
    session.add(table)

    # Create a product
    product = Product(
        name="Test Product",
        description="A test product",
        price=10.99,
        type=dish_type.ENTRADA,
        is_active=True,
    )
    session.add(product)
    session.commit()

    # Create an order
    order = Order(
        user_id=test_client_user.id,
        creator_id=test_waiter_user.id,
        table_id=table.id,
        status=order_status.PENDING,
        total=10.99,
    )
    session.add(order)
    session.commit()

    # Verify relationships
    retrieved_order = (
        session.query(Order)
        .filter_by(user_id=test_client_user.id)
        .first()
    )
    assert retrieved_order is not None
    assert retrieved_order.user.email == test_client_user.email
    assert retrieved_order.creator.email == test_waiter_user.email
    assert retrieved_order.table.number == 1
    assert retrieved_order.status == order_status.PENDING
    assert retrieved_order.total == 10.99


def test_cascade_delete(session, test_client_user):
    """Test cascade delete behavior."""
    # Create related objects
    table = Table(number=1, capacity=4, status=table_status.FREE)
    session.add(table)
    session.commit()

    order = Order(
        user_id=test_client_user.id,
        creator_id=test_client_user.id,
        table_id=table.id,
        status=order_status.PENDING,
        total=0,
    )
    session.add(order)
    session.commit()

    # Delete user and verify cascade
    session.delete(test_client_user)
    session.commit()

    # Verify order is deleted
    deleted_order = session.query(Order).filter_by(id=order.id).first()
    assert deleted_order is None

    # Verify table is not deleted (no cascade)
    table_exists = session.query(Table).filter_by(id=table.id).first()
    assert table_exists is not None