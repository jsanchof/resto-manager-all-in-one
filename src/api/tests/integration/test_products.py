import json
from models import Product, db

def test_get_products(client, auth_headers):
    # Create a test product
    product = Product(
        name='Test Product',
        description='Test Description',
        price=10.99,
        category='FOOD',
        image_url='test.jpg'
    )
    db.session.add(product)
    db.session.commit()

    response = client.get('/api/products', headers=auth_headers)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) > 0
    assert data[0]['name'] == 'Test Product'