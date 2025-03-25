import os
import sys
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from datetime import datetime, timezone

# Add project root to path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

from app.main import app
from app.core.config import AppConfig
from azure.cosmos import CosmosClient, PartitionKey

client = TestClient(app)


def test_upload_success():
    """Test successful file upload"""
    # First register and login a test user
    test_user = {"email": "testuser@8765.com", "password": "securepassword123"}

    # Login to get token
    login_response = client.post(
        "/login", headers={"Content-Type": "application/json"}, json=test_user
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create a test audio file
    test_file_path = os.path.join(os.path.dirname(__file__), "test_audio.mp3")
    with open(test_file_path, "wb") as f:
        f.write(b"test audio content")

    try:
        # Prepare test file and data
        with open(test_file_path, "rb") as f:
            files = {"file": ("test_audio.mp3", f, "audio/mpeg")}
            # Make request
            response = client.post(
                "/upload",
                headers=headers,
                files=files,
                data={"prompt_category_id": "123", "prompt_subcategory_id": "125"},
            )
    finally:
        # Clean up test file
        if os.path.exists(test_file_path):
            os.unlink(test_file_path)

    # Assert response
    assert response.status_code == 200
    response_data = response.json()
    assert response_data["status"] == "uploaded"
    assert "job_id" in response_data
    assert response_data["message"] == "File uploaded successfully"


def get_auth_headers(client, email="a@mous.uk", password="123456"):
    """Helper function to get auth headers"""
    # Register user if not exists
    client.post("/register", json={"email": email, "password": password})

    # Login to get token
    login_response = client.post("/login", json={"email": email, "password": password})
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_get_jobs_empty():
    """Test getting jobs when no jobs exist"""
    headers = get_auth_headers(client)
    response = client.get("/jobs", headers=headers)

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == 200
    assert data["message"] == "Jobs retrieved successfully"
    assert data["count"] == 0
    assert len(data["jobs"]) == 0


def test_get_jobs_with_data():
    """Test getting jobs after creating some test data"""
    headers = get_auth_headers(client)

    # First upload a test file to create a job
    test_file_path = os.path.join(os.path.dirname(__file__), "test_audio.mp3")
    with open(test_file_path, "wb") as f:
        f.write(b"test audio content")

    try:
        with open(test_file_path, "rb") as f:
            files = {"file": ("test_audio.mp3", f, "audio/mpeg")}
            upload_response = client.post(
                "/upload",
                headers=headers,
                files=files,
                data={"prompt_category_id": "123", "prompt_subcategory_id": "456"},
            )

        assert upload_response.status_code == 200
        job_id = upload_response.json()["job_id"]

        # Now test different filter scenarios

        # 1. Get all jobs
        response = client.get("/jobs", headers=headers)
        data = response.json()
        assert data["status"] == 200
        assert data["count"] >= 1
        assert any(job["id"] == job_id for job in data["jobs"])

        # 2. Filter by job_id
        response = client.get(f"/jobs?job_id={job_id}", headers=headers)
        data = response.json()
        assert data["status"] == 200
        assert data["count"] == 1
        assert data["jobs"][0]["id"] == job_id

        # 3. Filter by status
        response = client.get("/jobs?status=uploaded", headers=headers)
        data = response.json()
        assert data["status"] == 200
        assert all(job["status"] == "uploaded" for job in data["jobs"])

        # 4. Filter by prompt_subcategory_id
        response = client.get("/jobs?prompt_subcategory_id=456", headers=headers)
        data = response.json()
        assert data["status"] == 200
        assert all(job["prompt_subcategory_id"] == "456" for job in data["jobs"])

        # 5. Filter by created_at (today)
        today = datetime.now(timezone.utc).date()
        response = client.get(f"/jobs?created_at={today}", headers=headers)
        data = response.json()
        assert data["status"] == 200
        assert data["count"] >= 1

        # 6. Test non-existent job_id
        response = client.get("/jobs?job_id=nonexistent", headers=headers)
        data = response.json()
        assert data["status"] == 200
        assert data["count"] == 0

    finally:
        # Clean up test file
        if os.path.exists(test_file_path):
            os.unlink(test_file_path)
