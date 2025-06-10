"""
Script to populate the menu with initial data.
"""

from src.api.models import db, Product, Ingredient, ProductIngredient, Dishes, Drinks
from src.api import create_app


def populate_menu(app):
    """Populate the menu with initial data."""
    with app.app_context():
        # Create ingredients
        ingredients = {
            "tomato": Ingredient(name="Tomato", stock=100, unit="units"),
            "lettuce": Ingredient(name="Lettuce", stock=100, unit="units"),
            "cheese": Ingredient(name="Cheese", stock=100, unit="slices"),
            "beef": Ingredient(name="Beef Patty", stock=100, unit="units"),
            "bun": Ingredient(name="Burger Bun", stock=100, unit="units"),
            "chicken": Ingredient(name="Chicken Breast", stock=100, unit="units"),
            "bacon": Ingredient(name="Bacon", stock=100, unit="slices"),
            "onion": Ingredient(name="Onion", stock=100, unit="units"),
            "potato": Ingredient(name="Potato", stock=100, unit="kg"),
            "cola": Ingredient(name="Cola Syrup", stock=100, unit="liters"),
            "water": Ingredient(name="Carbonated Water", stock=100, unit="liters"),
            "coffee": Ingredient(name="Coffee Beans", stock=100, unit="kg"),
            "milk": Ingredient(name="Milk", stock=100, unit="liters"),
        }

        for ingredient in ingredients.values():
            db.session.add(ingredient)

        # Create products
        products = {
            "classic_burger": Product(
                name="Classic Burger",
                description="A juicy beef patty with fresh vegetables",
                price=10.99,
                image_url="https://example.com/classic-burger.jpg",
                category="main",
                available=True,
            ),
            "chicken_burger": Product(
                name="Chicken Burger",
                description="Grilled chicken breast with lettuce and mayo",
                price=9.99,
                image_url="https://example.com/chicken-burger.jpg",
                category="main",
                available=True,
            ),
            "fries": Product(
                name="French Fries",
                description="Crispy golden fries",
                price=3.99,
                image_url="https://example.com/fries.jpg",
                category="side",
                available=True,
            ),
            "cola": Product(
                name="Cola",
                description="Refreshing cola drink",
                price=2.99,
                image_url="https://example.com/cola.jpg",
                category="drink",
                available=True,
            ),
            "coffee": Product(
                name="Coffee",
                description="Fresh brewed coffee",
                price=2.49,
                image_url="https://example.com/coffee.jpg",
                category="drink",
                available=True,
            ),
        }

        for product in products.values():
            db.session.add(product)

        # Commit to get IDs
        db.session.commit()

        # Create product-ingredient relationships
        product_ingredients = [
            # Classic Burger
            ProductIngredient(
                product_id=products["classic_burger"].id,
                ingredient_id=ingredients["beef"].id,
                quantity=1,
            ),
            ProductIngredient(
                product_id=products["classic_burger"].id,
                ingredient_id=ingredients["bun"].id,
                quantity=1,
            ),
            ProductIngredient(
                product_id=products["classic_burger"].id,
                ingredient_id=ingredients["cheese"].id,
                quantity=1,
            ),
            ProductIngredient(
                product_id=products["classic_burger"].id,
                ingredient_id=ingredients["lettuce"].id,
                quantity=1,
            ),
            ProductIngredient(
                product_id=products["classic_burger"].id,
                ingredient_id=ingredients["tomato"].id,
                quantity=1,
            ),
            # Chicken Burger
            ProductIngredient(
                product_id=products["chicken_burger"].id,
                ingredient_id=ingredients["chicken"].id,
                quantity=1,
            ),
            ProductIngredient(
                product_id=products["chicken_burger"].id,
                ingredient_id=ingredients["bun"].id,
                quantity=1,
            ),
            ProductIngredient(
                product_id=products["chicken_burger"].id,
                ingredient_id=ingredients["lettuce"].id,
                quantity=1,
            ),
            # Fries
            ProductIngredient(
                product_id=products["fries"].id,
                ingredient_id=ingredients["potato"].id,
                quantity=0.2,
            ),
            # Cola
            ProductIngredient(
                product_id=products["cola"].id,
                ingredient_id=ingredients["cola"].id,
                quantity=0.2,
            ),
            ProductIngredient(
                product_id=products["cola"].id,
                ingredient_id=ingredients["water"].id,
                quantity=0.3,
            ),
            # Coffee
            ProductIngredient(
                product_id=products["coffee"].id,
                ingredient_id=ingredients["coffee"].id,
                quantity=0.02,
            ),
            ProductIngredient(
                product_id=products["coffee"].id,
                ingredient_id=ingredients["water"].id,
                quantity=0.2,
            ),
        ]

        for pi in product_ingredients:
            db.session.add(pi)

        # Create dishes and drinks
        dishes = [
            Dishes(product_id=products["classic_burger"].id),
            Dishes(product_id=products["chicken_burger"].id),
            Dishes(product_id=products["fries"].id),
        ]

        drinks = [
            Drinks(product_id=products["cola"].id),
            Drinks(product_id=products["coffee"].id),
        ]

        for dish in dishes:
            db.session.add(dish)

        for drink in drinks:
            db.session.add(drink)

        db.session.commit()
        print("Menu populated successfully!")


if __name__ == "__main__":
    app = create_app()
    populate_menu(app)
