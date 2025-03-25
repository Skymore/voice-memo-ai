import os
import sys
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from datetime import datetime, timezone

# Add project root to path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

from app.main import app

client = TestClient(app)


def get_auth_headers(client, email="moustafa@test.com", password="123456"):
    """Helper function to get auth headers"""
    # Register user if not exists
    client.post("/register", json={"email": email, "password": password})

    # Login to get token
    login_response = client.post("/login", json={"email": email, "password": password})
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_category_data():
    return [
        {
            "name": "Medical_GP",
            "subcategories": {
                "Consultation_Analysis": {
                    "CONSULTATION_ANALYSIS_PROMPT_MEDGP": "You are an AI assistant that translates conversations between medical professionals."
                },
                "Diagnostics_Support": {
                    "DIAGNOSTIC_SUPPORT_PROMPT_MEDGP": "You are an AI assistant helping medical professionals with diagnostic support."
                },
            },
        },
        {
            "name": "Social_Worker",
            "subcategories": {
                "Progress_Evaluation": {
                    "CONSULTATION_ANALYSIS_PROMPT_SOCIALWORKER": "You are an AI assistant designed to help adult social care workers evaluate progress."
                },
                "Risk_Assessment": {
                    "RISK_ASSESSMENT_PROMPT_SOCIALWORKER": "You are an AI assistant aiding social workers in conducting risk assessments."
                },
            },
        },
    ]


def test_create_prompt_category_success(test_category_data):
    """Test successful creation of multiple prompt categories"""
    # Get auth headers
    headers = get_auth_headers(client)
    headers["Content-Type"] = "application/json"

    for category in test_category_data:
        # Create category
        response = client.post("/create_prompt", headers=headers, json=category)

        # Assert response for the category
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == 200
        assert "category_id" in data
        assert (
            data["message"] == f"Category '{category['name']}' processed successfully"
        )

        # Verify each subcategory and prompt
        for subcategory_name, prompts in category["subcategories"].items():
            for prompt_key, prompt_text in prompts.items():
                assert prompt_key in prompts
                assert len(prompt_text) > 0


# def test_create_prompt_category_unauthorized():
#     """Test creating prompt category without authentication"""
#     response = client.post(
#         "/prompts/categories", json={"name": "Test Category", "subcategories": {}}
#     )
#     assert response.status_code == 401


# def test_get_prompt_categories_success(test_category_data):
#     """Test successful retrieval of prompt categories"""
#     # Get auth headers
#     headers = get_auth_headers(client)

#     # First create a category
#     headers["Content-Type"] = "application/json"
#     client.post("/prompts/categories", headers=headers, json=test_category_data)

#     # Get categories
#     response = client.get("/prompts/categories", headers=headers)

#     # Assert response
#     assert response.status_code == 200
#     data = response.json()
#     assert data["status"] == 200
#     assert "categories" in data

#     # Verify the structure matches our test data
#     categories = data["categories"]
#     assert "Medical_GP" in categories
#     assert "Consultation_Analysis" in categories["Medical_GP"]
#     assert (
#         "CONSULTATION_ANALYSIS_PROMPT_MEDGP"
#         in categories["Medical_GP"]["Consultation_Analysis"]
#     )
#     assert "Diagnostics_Support" in categories["Medical_GP"]
#     assert (
#         "DIAGNOSTIC_SUPPORT_PROMPT_MEDGP"
#         in categories["Medical_GP"]["Diagnostics_Support"]
#    )


# def test_get_prompt_categories_unauthorized():
#     """Test getting prompt categories without authentication"""
#     response = client.get("/prompts/categories")
#     assert response.status_code == 401


# def test_create_prompt_category_invalid_data():
#     """Test creating prompt category with invalid data"""
#     headers = get_auth_headers(client)
#     headers["Content-Type"] = "application/json"

#     # Test with missing required fields
#     invalid_data = {
#         "name": "Test Category"
#         # Missing subcategories
#     }
#     response = client.post("/prompts/categories", headers=headers, json=invalid_data)
#     assert response.status_code == 422  # Validation error

#     # Test with empty name
#     invalid_data = {"name": "", "subcategories": {}}
#     response = client.post("/prompts/categories", headers=headers, json=invalid_data)
#     assert response.status_code == 422  # Validation error
