"""
Setup configuration for the restaurant management system.
"""

from setuptools import setup, find_packages

setup(
    name="resto-manager",
    version="1.0.0",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        # Core Flask dependencies
        "flask>=3.1.1",
        "flask-sqlalchemy>=3.1.1",
        "flask-migrate>=4.0.5",
        "flask-jwt-extended>=4.7.1",
        "flask-cors>=4.0.0",
        "flask-admin>=1.6.1",
        "flask-bcrypt>=1.0.1",
        "flask-swagger",
        # Database dependencies
        "psycopg2-binary>=2.9.9",
        "sqlalchemy>=2.0.41",
        "alembic>=1.13.1",
        # Utility dependencies
        "python-dotenv>=1.0.1",
        "gunicorn>=21.2.0",
        "cloudinary>=1.38.0",
        "werkzeug>=3.0.1",
        "wtforms>=3.1.2",
        "pyyaml>=6.0.1",
        "typing-extensions",
        "faker",  # For generating test data
        "colorama",  # For colored terminal output
        "tomli",  # For TOML file parsing
    ],
    extras_require={
        "dev": [
            "black>=25.1.0",
            "flake8>=7.2.0",
            "pytest>=8.0.0",
            "pytest-cov>=4.1.0",
            "pytest-xdist>=3.5.0",  # Optional: for parallel test execution
            "pytest-flask>=1.3.0",  # Optional: for Flask-specific testing
        ]
    },
    python_requires=">=3.11",
)
