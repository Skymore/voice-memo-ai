import logging
import sys
from dotenv import load_dotenv
from contextlib import asynccontextmanager

# Import FastAPI and routers after environment is configured
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, upload, prompts
from fastapi import Request
from azure.identity import DefaultAzureCredential

default_credential = DefaultAzureCredential()

# Load environment variables first
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.debug("Available routes:")
    yield


app = FastAPI(lifespan=lifespan)
app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(prompts.router)
# # Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    logger.debug("Root endpoint called")
    return {"message": "Audio Summarization API"}


@app.get("/echo")
async def echo_request():
    """Simple echo endpoint that returns the request data"""
    # data = request.json()
    # logger.debug(f"Received data: {data}")
    return {"message": "Echo successful"}
