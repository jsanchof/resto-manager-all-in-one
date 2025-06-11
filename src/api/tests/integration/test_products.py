import json
from src.api.models import Dish, db


def test_get_products(client, auth_headers):
    # Create a test dish
    dish = Dish(
        name="Test Product",
        description="Test Description",
        price=10.99,
        dish_type="MAIN",
        preparation_time=10,
        is_active=True,
        image_url="test.jpg",
    )
    db.session.add(dish)
    db.session.commit()

    response = client.get("/api/products/productos", headers=auth_headers)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data["items"]) > 0
    assert data["items"][0]["name"] == "Test Product"
