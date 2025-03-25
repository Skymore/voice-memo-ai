from app.core.config import AppConfig, CosmosDB
from azure.cosmos import CosmosClient, PartitionKey
from datetime import datetime, timezone
import json
from fastapi.testclient import TestClient
from app.main import app
import random
import string
from azure.identity import DefaultAzureCredential


client = TestClient(app)


def test_database_container_creation():
    """Test actual database and container creation"""
    # Initialize config and cosmos client
    config = AppConfig()
    database_name = config.cosmos["database"]
    container_name = config.cosmos["container"]
    credential = DefaultAzureCredential()
    client = CosmosClient(url=config.cosmos["endpoint"], credential=credential)

    # First, create database
    try:
        database = client.create_database(database_name)
        print(f"Created new database: {database_name}")
    except Exception as _:
        print(f"Database {database_name} already exists")
        database = client.get_database_client(database_name)

    # Verify database exists
    database_properties = database.read()
    assert database_properties["id"] == database_name
    print("Database verification successful")

    # Then, create container
    try:
        container = database.create_container(
            id=container_name, partition_key=PartitionKey(path="/id")
        )
        print(f"Created new container: {container_name}")
    except Exception as _:
        print(f"Container {container_name} already exists")
        container = database.get_container_client(container_name)

    # Verify container exists and has correct configuration
    container_properties = container.read()
    assert container_properties["id"] == container_name
    assert container_properties["partitionKey"]["paths"][0] == "/id"
    print("Container verification successful")


def generate_random_email():
    random_string = "".join(random.choices(string.ascii_lowercase, k=8))
    return f"{random_string}@moustafa.uk"


TEST_EMAIL = generate_random_email()
TEST_PASSWORD = "testpassword123"


def test_create_user():
    """Test user creation via API endpoint"""
    # Create test user data
    test_data = {"email": TEST_EMAIL, "password": TEST_PASSWORD}

    # Make request to register endpoint
    response = client.post(
        "/register", headers={"Content-Type": "application/json"}, json=test_data
    )
    print(response.json())
    # Verify response
    assert response.status_code == 200
    created_user = response.json()
    assert created_user["status"] == 200
    assert created_user["message"] == f"User {test_data['email']} created successfully"


def test_verify_user_exists():
    """Test user exists in database"""
    # Verify user exists in database
    config = AppConfig()
    credential = DefaultAzureCredential()
    cosmos_client = CosmosClient(url=config.cosmos["endpoint"], credential=credential)
    database = cosmos_client.get_database_client(config.cosmos["database"])
    container = database.get_container_client(config.cosmos["container"])

    # Query for the user
    query = "SELECT * FROM c WHERE c.type = 'user' AND c.email = @email"
    parameters = [{"name": "@email", "value": TEST_EMAIL}]
    users = list(
        container.query_items(
            query=query, parameters=parameters, enable_cross_partition_query=True
        )
    )
    retrieved_user = users[0] if users else None

    assert retrieved_user is not None
    assert retrieved_user["email"] == TEST_EMAIL

    print("User registration and verification successful")


def test_login():
    """Test user login via API endpoint"""
    # First register a test user
    test_data = {"email": TEST_EMAIL, "password": TEST_PASSWORD}

    # Test successful login
    login_response = client.post(
        "/login", headers={"Content-Type": "application/json"}, json=test_data
    )
    login_data = login_response.json()
    print("Login response:", login_data)
    assert login_data["status"] == 200
    assert login_data["message"] == "Login successful"
    assert "access_token" in login_data
    assert login_data["token_type"] == "bearer"

    # Test login with wrong password
    wrong_password_data = {"email": TEST_EMAIL, "password": "wrongpassword"}
    wrong_password_response = client.post(
        "/login",
        headers={"Content-Type": "application/json"},
        json=wrong_password_data,
    )
    wrong_password_data = wrong_password_response.json()
    assert wrong_password_data["status"] == 401
    assert wrong_password_data["message"] == "Incorrect email or password"
