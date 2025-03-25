import sys
import os

# Determine the project root (adjust as necessary)
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# Add the project root to sys.path
sys.path.append(project_root)


import asyncio
from datetime import datetime, timezone
from typing import Any
from fastapi import HTTPException
from passlib.context import CryptContext
from app.core.config import AppConfig, CosmosDB, DatabaseError
import logging

# Setup logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Define password context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Registration data
email = "a@b.com"
password = "asdfgh"

if not email or not password:
    logger.warning("Registration attempt with missing email or password")

# Initialize the application config
config = AppConfig()


# Asynchronous function to handle the user registration
async def register_user(email: str, password: str):
    try:
        cosmos_db = CosmosDB(config)
        logger.debug("CosmosDB client initialized")

        # Check if user already exists
        existing_user = await cosmos_db.get_user_by_email(email)
        if existing_user:
            logger.warning(f"Registration attempt for existing email: {email}")
            return {"status": 400, "message": "Email already registered"}

        # Create new user document
        timestamp = int(datetime.now(timezone.utc).timestamp() * 1000)  # milliseconds
        user_data = {
            "id": f"user_{timestamp}",
            "type": "user",
            "email": email,
            "hashed_password": pwd_context.hash(password),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        logger.debug(f"Attempting to create user with data: {user_data}")

        created_user = await cosmos_db.create_user(user_data)
        logger.info(f"User successfully created with ID: {created_user['id']}")
        return {"status": 200, "message": f"User {email} created successfully"}

    except ValueError as e:
        logger.error(f"Error creating user: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    except DatabaseError as e:
        logger.error(f"Database error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=503, detail="Database service unavailable")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


# Run the async function in an event loop
if __name__ == "__main__":
    asyncio.run(register_user(email, password))
