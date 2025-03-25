from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from azure.cosmos.exceptions import CosmosHttpResponseError
import logging
import traceback
from fastapi import Request
from app.core.config import AppConfig, CosmosDB, DatabaseError

# Setup logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: str | None = None


class UserBase(BaseModel):
    email: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: str
    created_at: str
    updated_at: str


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, config: AppConfig) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=config.auth["jwt_access_token_expire_minutes"]
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, config.auth["jwt_secret_key"], algorithm=config.auth["jwt_algorithm"]
    )
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    config = AppConfig()
    cosmos_db = CosmosDB(config)

    try:
        payload = jwt.decode(
            token,
            config.auth["jwt_secret_key"],
            algorithms=[config.auth["jwt_algorithm"]],
        )
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception

    try:
        # Await the async call to `get_user_by_email`
        user = await cosmos_db.get_user_by_email(email=token_data.email)
        if user is None:
            raise credentials_exception
        return user
    except Exception as e:
        raise credentials_exception


async def authenticate_user(
    cosmos_db: CosmosDB, email: str, password: str
) -> Dict[str, Any] | bool:
    """Authenticate user credentials."""
    user = await cosmos_db.get_user_by_email(email)  # Await the async method
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    return user


@router.post("/login")
async def login_for_access_token(request: Request):
    """Handle user login and token generation."""
    try:
        # Parse request data
        data = await request.json()
        email = data.get("email")
        password = data.get("password")

        # Validate inputs
        if not email or not password:
            logger.warning("Login attempt with missing email or password")
            return {"status": 400, "message": "Email and password are required"}

        # Initialize configuration and database connection
        config = AppConfig()
        try:
            cosmos_db = CosmosDB(config)
            logger.debug("CosmosDB client initialized for login")
        except DatabaseError as e:
            logger.error(f"Database initialization failed: {str(e)}")
            return {"status": 503, "message": "Database service unavailable"}

        # Authenticate user
        try:
            user = await authenticate_user(cosmos_db, email, password)  # Await here
            if not user:
                logger.warning(f"Failed login attempt for email: {email}")
                return {"status": 401, "message": "Incorrect email or password"}

            # Generate access token
            access_token = create_access_token(
                data={"sub": user["email"]}, config=config
            )
            logger.info(f"Successful login for user: {email}")
            return {
                "status": 200,
                "message": "Login successful",
                "access_token": access_token,
                "token_type": "bearer",
            }
        except Exception as e:
            logger.error(f"Error during authentication: {str(e)}", exc_info=True)
            return {"status": 500, "message": f"Authentication error: {str(e)}"}

    except Exception as e:
        logger.error(f"Unexpected error during login: {str(e)}", exc_info=True)
        return {"status": 500, "message": f"An unexpected error occurred: {str(e)}"}


@router.post("/register")
async def register_user(request: Request):
    try:
        data = await request.json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            logger.warning("Registration attempt with missing email or password")
            return {"status": 400, "message": "Email and password are required"}

        config = AppConfig()
        try:
            cosmos_db = CosmosDB(config)
            logger.debug("CosmosDB client initialized")
        except DatabaseError as e:
            logger.error(f"Database initialization failed: {str(e)}")
            return {"status": 503, "message": "Database service unavailable"}

        # Check if user already exists
        try:
            existing_user = await cosmos_db.get_user_by_email(email)  # Use await here
            if existing_user:
                logger.warning(f"Registration attempt for existing email: {email}")
                return {"status": 400, "message": "Email already registered"}
        except ValueError as e:
            logger.error(f"Error checking existing user: {str(e)}", exc_info=True)
            return {
                "status": 500,
                "message": f"Error checking user existence: {str(e)}",
            }

        # Create new user document
        timestamp = int(
            datetime.now(timezone.utc).timestamp() * 1000
        )  # milliseconds since epoch
        user_data = {
            "id": f"user_{timestamp}",
            "type": "user",
            "email": email,
            "hashed_password": get_password_hash(password),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        logger.debug(f"Attempting to create user with data: {user_data}")

        try:
            created_user = await cosmos_db.create_user(user_data)  # Use await here
            logger.info(f"User successfully created with ID: {created_user['id']}")
            return {"status": 200, "message": f"User {email} created successfully"}
        except ValueError as e:
            logger.error(f"Error creating user: {str(e)}", exc_info=True)
            return {"status": 500, "message": f"Error creating user: {str(e)}"}
        except Exception as e:
            logger.error(f"Unexpected error creating user: {str(e)}", exc_info=True)
            return {
                "status": 500,
                "message": f"Unexpected error creating user: {str(e)}",
            }

    except Exception as e:
        logger.error(f"Unexpected error during registration: {str(e)}", exc_info=True)
        return {"status": 500, "message": f"An unexpected error occurred: {str(e)}"}
