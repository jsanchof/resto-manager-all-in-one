"""
Database management utilities for resetting and populating the database.
"""
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from src.api.models import User, db, user_role
from werkzeug.security import generate_password_hash

def reset_database():
    """Reset the database by dropping and recreating it."""
    # Connect to postgres database
    conn = psycopg2.connect(
        dbname='postgres',
        user='postgres',
        password='admin1234',
        host='localhost',
        port='5432'
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()
    
    # Drop connections to the database
    cur.execute("""
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = 'restaurant'
        AND pid <> pg_backend_pid();
    """)
    
    # Drop and recreate database
    cur.execute("DROP DATABASE IF EXISTS restaurant;")
    cur.execute("CREATE DATABASE restaurant;")
    
    # Connect to the new database
    cur.close()
    conn.close()
    
    # Connect to the restaurant database
    conn = psycopg2.connect(
        dbname='restaurant',
        user='postgres',
        password='admin1234',
        host='localhost',
        port='5432'
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()
    
    # Create uuid-ossp extension
    cur.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
    
    # Close connection
    cur.close()
    conn.close()
    print("Database 'restaurant' has been reset successfully!")

def create_admin_user(app):
    """Create the default admin user."""
    with app.app_context():
        # Check if admin user already exists
        if User.query.filter_by(email="admin@admin.com").first() is None:
            admin = User(
                email="admin@admin.com",
                password=generate_password_hash("admin"),
                name="Admin",
                last_name="User",
                phone_number="1234567890",
                is_active=True,
                role=user_role.ADMIN
            )
            db.session.add(admin)
            db.session.commit()
            print("Admin user created successfully!")
        else:
            print("Admin user already exists!")

def create_test_users(app):
    """Create test users for each role."""
    with app.app_context():
        test_users = [
            {
                "email": "waiter@test.com",
                "password": "waiter123",
                "name": "Waiter",
                "last_name": "Test",
                "phone_number": "1234567891",
                "role": user_role.WAITER
            },
            {
                "email": "kitchen@test.com",
                "password": "kitchen123",
                "name": "Kitchen",
                "last_name": "Staff",
                "phone_number": "1234567892",
                "role": user_role.KITCHEN
            },
            {
                "email": "client@test.com",
                "password": "client123",
                "name": "Client",
                "last_name": "Test",
                "phone_number": "1234567893",
                "role": user_role.CLIENT
            }
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
                    role=user_data["role"]
                )
                db.session.add(user)
                print(f"{user_data['role'].value} user created successfully!")
            else:
                print(f"{user_data['role'].value} user already exists!")
        
        db.session.commit()

if __name__ == "__main__":
    reset_database() 