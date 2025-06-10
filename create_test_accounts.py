import requests
import json

# Backend URL
BACKEND_URL = "http://127.0.0.1:3001/api"

# Test accounts data
test_accounts = [
    {
        "name": "Admin",
        "last_name": "Test",
        "phone_number": "1234567890",
        "email": "admin@test.com",
        "password": "admin123",
        "role": "ADMIN"
    },
    {
        "name": "Cliente",
        "last_name": "Test",
        "phone_number": "1234567891",
        "email": "cliente@test.com",
        "password": "cliente123",
        "role": "CLIENTE"
    },
    {
        "name": "Mesero",
        "last_name": "Test",
        "phone_number": "1234567892",
        "email": "mesero@test.com",
        "password": "mesero123",
        "role": "MESERO"
    },
    {
        "name": "Cocina",
        "last_name": "Test",
        "phone_number": "1234567893",
        "email": "cocina@test.com",
        "password": "cocina123",
        "role": "COCINA"
    }
]

def create_account(account_data):
    try:
        response = requests.post(
            f"{BACKEND_URL}/register",
            json=account_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\nCreating account for {account_data['email']}:")
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        return response.json()
    except Exception as e:
        print(f"Error creating account for {account_data['email']}: {str(e)}")
        return None

def main():
    print("Creating test accounts...")
    
    for account in test_accounts:
        result = create_account(account)
        if result:
            print(f"Account created for {account['email']}")
    
    print("\nTest accounts created. Here are the credentials:")
    print("\nRole\t\tEmail\t\t\tPassword")
    print("-" * 50)
    for account in test_accounts:
        print(f"{account['role']}\t{account['email']}\t{account['password']}")

if __name__ == "__main__":
    main() 