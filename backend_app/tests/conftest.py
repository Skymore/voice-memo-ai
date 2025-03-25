import os
import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from passlib.context import CryptContext

from app.main import app
from app.core.config import AppConfig, CosmosDB

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@pytest.fixture
def test_app():
    """Test FastAPI application"""
    return app


@pytest.fixture
def client(test_app):
    """Test client"""
    return TestClient(test_app)


@pytest.fixture
def mock_cosmos_client():
    """Mock Cosmos DB client"""
    with patch("azure.cosmos.CosmosClient") as mock_client:
        # Mock database client
        mock_db = MagicMock()
        mock_client.return_value.get_database_client.return_value = mock_db

        # Mock container client
        mock_container = MagicMock()
        mock_db.get_container_client.return_value = mock_container

        yield {"client": mock_client, "container": mock_container}


@pytest.fixture
def test_user():
    """Create a test user data"""
    timestamp = datetime.now(timezone.utc).isoformat()
    return {
        "id": f"user_{timestamp}",
        "email": "test@example.com",
        "hashed_password": pwd_context.hash("testpassword123"),
        "created_at": timestamp,
        "updated_at": timestamp,
    }
