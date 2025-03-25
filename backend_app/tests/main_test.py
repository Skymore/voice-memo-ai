import sys
import os

# Determine the project root (adjust as necessary)
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# Add the project root to sys.path
sys.path.append(project_root)

import json
import logging
from typing import Dict, Any
from passlib.context import CryptContext
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

# If you rely on Azure, keep this import; otherwise, remove it
from azure.core.exceptions import AzureError

# Import from your application
from app.core.database import SessionLocal
from app.models.user import User
from app.models.file import File
from app.models.job import Job
from app.main import app
from app.core.config import AppConfig  # If needed for config details

# Initialize logging
logging.basicConfig(level=logging.INFO)

# Initialize test client
client = TestClient(app)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def log_request_response(
    request_data: Dict[str, Any],
    response_data: Dict[str, Any],
    headers: Dict[str, str],
) -> None:
    """Helper function to log request and response details"""
    logging.info("\n" + "=" * 50)
    logging.info("REQUEST:")
    logging.info(f"Headers: {json.dumps(headers, indent=2)}")
    logging.info(f"Payload: {json.dumps(request_data, indent=2)}")
    logging.info("\nRESPONSE:")
    logging.info(f"Status Code: {response_data.get('status_code')}")
    logging.info(f"Body: {json.dumps(response_data.get('body', {}), indent=2)}")
    logging.info("=" * 50 + "\n")


def main():
    """
    1. Create a database session
    2. Create or ensure a test user exists, cleaning up if necessary
    3. Log in to obtain a JWT token
    4. Upload a file
    5. Log and verify the response
    6. Clean up (delete the job and file from DB)
    7. Cleanup the user from DB
    """
    db = SessionLocal()

    try:
        # -----------------------
        # 1. Create / Clean test user
        # -----------------------
        test_email = "test_upload@example.com"
        test_password = "TestUpload123"
        hashed_password = pwd_context.hash(test_password)

        # Remove existing test user if present (along with jobs/files)
        existing_user = db.query(User).filter(User.email == test_email).first()
        if existing_user:
            logging.info("Cleaning up existing user before creating new one...")
            # Delete associated jobs
            db.query(Job).filter(Job.user_id == existing_user.id).delete()
            # Delete associated files (based on job.file_id)
            db.query(File).filter(
                File.id.in_(
                    db.query(Job.file_id).filter(Job.user_id == existing_user.id)
                )
            ).delete()
            # Delete the user
            db.query(User).filter(User.id == existing_user.id).delete()
            db.commit()

        # Create new user
        logging.info(f"Creating user '{test_email}'")
        user = User(email=test_email, hashed_password=hashed_password)
        db.add(user)
        db.commit()
        db.refresh(user)

        # -----------------------
        # 2. Log in to obtain token
        # -----------------------
        login_payload = {"email": test_email, "password": test_password}
        logging.info("Logging in to obtain JWT token...")
        response = client.post("/auth/login", json=login_payload)
        if response.status_code != 200:
            logging.error(
                f"Failed to log in. Status code: {response.status_code}, "
                f"Response: {response.text}"
            )
            return

        token_response = response.json()
        token = token_response.get("access_token")
        if not token:
            logging.error("No access token returned from login endpoint.")
            return

        auth_headers = {"Authorization": f"Bearer {token}"}

        # -----------------------
        # 3. Upload the file
        # -----------------------
        # Adjust this path to point to a valid file you want to upload.
        test_file_path = os.path.join(os.path.dirname(__file__), "test111.mp3")

        # In a real scenario, you might want to check if the file actually exists:
        if not os.path.isfile(test_file_path):
            logging.error(f"Test file not found at path: {test_file_path}")
            return

        payload = {"file_path": test_file_path}
        logging.info("Making upload request...")

        upload_response = client.post("/upload", json=payload, headers=auth_headers)
        log_request_response(
            request_data=payload,
            response_data={
                "status_code": upload_response.status_code,
                "body": upload_response.json()
                if upload_response.status_code == 200
                else upload_response.text,
            },
            headers=auth_headers,
        )

        if upload_response.status_code != 200:
            logging.error(
                f"File upload failed. Status code: {upload_response.status_code}, "
                f"Response: {upload_response.text}"
            )
            return

        upload_data = upload_response.json()
        file_id = upload_data.get("file_id")
        job_id = upload_data.get("job_id")
        status = upload_data.get("status")
        message = upload_data.get("message")

        logging.info(
            f"Upload response -> file_id: {file_id}, job_id: {job_id}, status: {status}, message: {message}"
        )

        # -----------------------
        # 4. Validate DB records
        # -----------------------
        if not file_id or not job_id:
            logging.error("Missing file_id or job_id in upload response.")
            return

        uploaded_file = db.query(File).filter(File.id == file_id).first()
        if not uploaded_file:
            logging.error("Uploaded file record not found in the database.")
        else:
            logging.info(f"Uploaded file record found. Status: {uploaded_file.status}")

        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            logging.error("Job record not found in the database.")
        else:
            logging.info(
                f"Job record found. Status: {job.status}, user_id: {job.user_id}"
            )

        # -----------------------
        # 5. Cleanup records (job + file), then user
        # -----------------------
        logging.info("Cleaning up test data...")
        if job_id:
            db.query(Job).filter(Job.id == job_id).delete()
        if file_id:
            db.query(File).filter(File.id == file_id).delete()
        db.commit()

        # Cleanup user
        logging.info("Cleaning up test user...")
        db.query(User).filter(User.id == user.id).delete()
        db.commit()

        logging.info("Cleanup completed successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    main()
