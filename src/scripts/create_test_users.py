import os
import sys
from sqlalchemy import text
from werkzeug.security import generate_password_hash

# Add the src directory to the Python path
sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)

from src.app import app
from src.api import db
from src.api.models import User, user_role


def create_test_users():
    """Create test users for different roles"""
    with app.app_context():
        # Initialize database
        print("Initializing database...")
        with db.engine.connect() as connection:
            connection.execute(text("DROP SCHEMA public CASCADE;"))
            connection.execute(text("CREATE SCHEMA public;"))
            connection.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
            connection.commit()

        # Create all tables
        print("Creating tables...")
        db.create_all()

        print("Creating test users...")
        # Test users for all roles
        test_users = [
            {
                "email": "waiter@test.com",
                "password": "waiter123",
                "name": "Waiter",
                "last_name": "Test",
                "phone_number": "1234567891",
                "role": user_role.WAITER,
            },
            {
                "email": "kitchen@test.com",
                "password": "kitchen123",
                "name": "Kitchen",
                "last_name": "Staff",
                "phone_number": "1234567892",
                "role": user_role.KITCHEN,
            },
            {
                "email": "client@test.com",
                "password": "client123",
                "name": "Client",
                "last_name": "Test",
                "phone_number": "1234567893",
                "role": user_role.CLIENT,
            },
        ]

        for user_data in test_users:
            if User.query.filter_by(email=user_data["email"]).first() is None:
                user = User(
                    email=user_data["email"],
                    password=generate_password_hash(user_data["password"]),
                    name=user_data["name"],
                    last_name=user_data["last_name"],
                    phone_number=user_data["phone_number"],
                    is_active=True,
                    role=user_data["role"],
                )
                db.session.add(user)
                print(f"{user_data['role'].value} user created successfully!")
            else:
                print(f"{user_data['role'].value} user already exists!")

        db.session.commit()
        print("Test user accounts created successfully!")


if __name__ == "__main__":
    create_test_users()
