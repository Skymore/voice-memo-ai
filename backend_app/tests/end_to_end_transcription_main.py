import sys
import os

# Determine the project root (adjust as necessary)
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# Add the project root to sys.path
sys.path.append(project_root)
import time
from dotenv import load_dotenv
from fastapi.testclient import TestClient
from passlib.context import CryptContext
from sqlalchemy.orm import Session

# Import from your existing codebase
from app.main import app
from app.core.database import SessionLocal
from app.models.user import User
from app.models.file import File
from app.models.job import Job

# Initialize TestClient and password context
client = TestClient(app)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def main():
    """
    A standalone script that:
    1. Loads environment variables
    2. Creates a test user and logs in to obtain a JWT token
    3. Uploads a file
    4. Initiates transcription
    5. Polls for completion
    6. Cleans up records in the DB
    """

    # 1. Load environment variables
    load_dotenv(dotenv_path=".env.test")
    DATABASE_URL = os.getenv("DATABASE_URL")
    API_URL = os.getenv("API_URL")
    print(f"Using DATABASE_URL={DATABASE_URL}")
    print(f"Using API_URL={API_URL}")

    # Create a DB session
    db = SessionLocal()

    # Variables to store references for cleanup
    file_id = None
    job_id = None
    user = None

    try:
        # 2. Create test user
        user, password = create_test_user(db)

        # 3. Login to get auth headers
        auth_headers = login_user(API_URL, user, password)

        # 4. Upload file
        file_id, job_id = upload_file_and_check(API_URL, auth_headers, db)

        # 5. Initiate transcription
        transcription_id = initiate_transcription(
            API_URL, auth_headers, db, file_id, job_id
        )

        print("Transcription submitted successfully.")
        print(f"Job ID: {job_id}")
        print(f"Transcription ID: {transcription_id}")

        check_transcription_status(
            api_url=API_URL, auth_headers=auth_headers, db=db, job_id=job_id
        )
        print("Transcription completed successfully.")

    finally:
        # 6. Cleanup
        cleanup_records(db, user, file_id, job_id)

        # Close DB session
        db.close()


def create_test_user(db: Session) -> tuple[User, str]:
    """
    Creates a test user in the DB, removing any existing user
    with the same email. Returns (user, plaintext_password).
    """
    email = "test_transcribe@example.com"
    password = "TestTranscribe123"
    hashed_password = pwd_context.hash(password)

    # Clean up any existing user
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        print("Existing user found. Cleaning up old user data...")
        db.query(Job).filter(Job.user_id == existing_user.id).delete()
        db.query(File).filter(
            File.id.in_(db.query(Job.file_id).filter(Job.user_id == existing_user.id))
        ).delete()
        db.query(User).filter(User.id == existing_user.id).delete()
        db.commit()

    # Create new user
    print(f"Creating new test user: {email}")
    user = User(email=email, hashed_password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user, password


def login_user(api_url: str, user: User, password: str) -> dict:
    """
    Logs in the specified user and returns auth headers with Bearer token.
    Raises Exception if login fails.
    """
    login_response = client.post(
        f"{api_url}/auth/login", json={"email": user.email, "password": password}
    )

    if login_response.status_code != 200:
        raise Exception(
            f"Login failed with status {login_response.status_code}: {login_response.text}"
        )

    token = login_response.json().get("access_token")
    if not token:
        raise Exception("No access_token found in login response.")

    auth_headers = {"Authorization": f"Bearer {token}"}
    print("Login successful. Obtained token.")
    return auth_headers


def upload_file_and_check(
    api_url: str, auth_headers: dict, db: Session
) -> tuple[int, int]:
    """
    Uploads a file using /files/upload, validates DB records,
    returns (file_id, job_id).
    """
    test_file_name = "test_audio.mp3"
    test_file_path = os.path.join(os.path.dirname(__file__), test_file_name)

    # Ensure file exists
    if not os.path.isfile(test_file_path):
        raise Exception(f"Test audio file not found: {test_file_path}")

    # Upload the file
    upload_payload = {"file_path": test_file_path}
    print(f"Uploading file: {test_file_path}")
    upload_response = client.post(
        f"{api_url}/upload", json=upload_payload, headers=auth_headers
    )

    if upload_response.status_code != 200:
        raise Exception(
            f"File upload failed: {upload_response.status_code}, {upload_response.text}"
        )

    upload_data = upload_response.json()
    print("Upload Response:", upload_data)

    # Extract IDs
    file_id = upload_data["file_id"]
    job_id = upload_data["job_id"]

    # Verify status
    if upload_data["status"] != "file_uploaded":
        raise Exception(f"Unexpected upload status: {upload_data['status']}")

    if upload_data["message"] != "File uploaded successfully":
        raise Exception(f"Unexpected message: {upload_data['message']}")

    # Check DB
    uploaded_file = db.query(File).filter(File.id == file_id).first()
    if not uploaded_file:
        raise Exception("Uploaded file record not found in DB.")
    if uploaded_file.status != "uploaded":
        raise Exception(f"Unexpected DB file status: {uploaded_file.status}")

    upload_job = db.query(Job).filter(Job.id == job_id).first()
    if not upload_job:
        raise Exception("Job record not found in DB.")
    if upload_job.status != "file_uploaded":
        raise Exception(f"Unexpected job status: {upload_job.status}")

    return file_id, job_id


def initiate_transcription(
    api_url: str, auth_headers: dict, db: Session, file_id: int, job_id: int
) -> str:
    """
    Initiates the transcription process by calling POST /transcribe.
    Returns the transcription_id.
    """
    # Submit transcription job
    transcribe_payload = {"file_id": file_id, "job_id": job_id}
    print(f"Submitting transcription job for File ID: {file_id}")
    transcribe_response = client.post(
        f"{api_url}/transcribe", json=transcribe_payload, headers=auth_headers
    )

    if transcribe_response.status_code != 200:
        raise Exception(
            f"Transcription endpoint call failed: {transcribe_response.status_code}, {transcribe_response.text}"
        )

    transcribe_data = transcribe_response.json()
    print("Transcribe Response:", transcribe_data)

    transcription_id = transcribe_data.get("transcription_id")
    status = transcribe_data.get("status")

    if status != "transcribing":
        raise Exception(f"Unexpected transcription status: {status}")

    if not transcription_id:
        raise Exception("No transcription_id found in response.")

    return transcription_id


def check_transcription_status(
    api_url: str, auth_headers: dict, db: Session, job_id: int
):
    """
    Checks the status of a transcription job by calling GET /transcribe/{job_id}/status
    and waits until the job is completed or failed.
    """
    max_attempts = 10
    attempt = 0
    wait_seconds = 5

    while attempt < max_attempts:
        print(
            f"Checking status for Job ID: {job_id} (Attempt {attempt + 1}/{max_attempts})"
        )
        status_response = client.get(
            f"{api_url}/transcribe/{job_id}/status", headers=auth_headers
        )

        if status_response.status_code != 200:
            raise Exception(
                f"Status check failed: {status_response.status_code}, {status_response.text}"
            )

        status_data = status_response.json()
        print("Status Response:", status_data)

        status = status_data.get("status")

        if status == "transcription_completed":
            print("Transcription completed successfully.")
            break
        elif status == "transcription_failed":
            raise Exception("Transcription failed.")
        else:
            print(
                f"Transcription status: {status}. Waiting for {wait_seconds} seconds before next check."
            )
            time.sleep(wait_seconds)
            attempt += 1

    else:
        raise Exception("Transcription did not complete within the expected time.")


def cleanup_records(db: Session, user: User, file_id: int, job_id: int):
    """
    Cleans up the test user, file, and job from the database.
    """
    print("Cleaning up records...")
    if job_id is not None:
        db.query(Job).filter(Job.id == job_id).delete()
    if file_id is not None:
        db.query(File).filter(File.id == file_id).delete()
    if user is not None:
        db.query(Job).filter(Job.user_id == user.id).delete()
        db.query(File).filter(
            File.id.in_(db.query(Job.file_id).filter(Job.user_id == user.id))
        ).delete()
        db.query(User).filter(User.id == user.id).delete()

    db.commit()
    print("Cleanup completed.")


if __name__ == "__main__":
    main()
