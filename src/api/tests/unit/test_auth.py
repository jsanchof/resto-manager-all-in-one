import json
from models import User

def test_register(client):
    response = client.post('/api/register', json={
        'email': 'test@test.com',
        'password': 'test1234',
        'name': 'Test User',
        'last_name': 'Test Last',
        'phone': '1234567890'
    })
    assert response.status_code == 201
    data = json.loads(response.data)
    assert 'message' in data
    assert data['message'] == 'User created successfully'

def test_login(client):
    # First create a user
    client.post('/api/register', json={
        'email': 'test@test.com',
        'password': 'test1234',
        'name': 'Test User',
        'last_name': 'Test Last',
        'phone': '1234567890'
    })
    
    # Then try to login
    response = client.post('/api/login', json={
        'email': 'test@test.com',
        'password': 'test1234'
    })
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'access_token' in data