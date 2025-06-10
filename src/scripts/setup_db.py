"""
Main script to set up the database from scratch.
This will:
1. Reset the database
2. Create tables
3. Create admin user and test users
4. Populate menu
"""
import os
import sys

# Add the src directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.api import create_app
from db_management import reset_database, create_admin_user, create_test_users
from populate_menu import populate_menu

def setup_database():
    """Set up the database from scratch."""
    # Reset database
    print("Resetting database...")
    reset_database()
    
    # Create application context
    app = create_app()
    
    # Create admin user
    print("\nCreating admin user...")
    create_admin_user(app)
    
    # Create test users
    print("\nCreating test users...")
    create_test_users(app)
    
    # Populate menu
    print("\nPopulating menu...")
    populate_menu(app)
    
    print("\nDatabase setup completed successfully!")

if __name__ == "__main__":
    setup_database() 