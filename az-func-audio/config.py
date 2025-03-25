import os
import logging
from dotenv import load_dotenv
import ast

# Load environment variables
load_dotenv()

# Setup logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


def get_required_env_var(var_name: str) -> str:
    """Get a required environment variable or raise an error with a helpful message"""
    value = os.getenv(var_name)
    if not value:
        logger.error(f"Required environment variable {var_name} is not set")
        raise ValueError(f"Required environment variable {var_name} is not set")
    return value


class AppConfig:
    def __init__(self):
        try:
            prefix = os.getenv("AZURE_COSMOS_DB_PREFIX", "voice_")

            # Cosmos DB settings
            self.cosmos_endpoint: str = get_required_env_var("AZURE_COSMOS_ENDPOINT")
            self.cosmos_database: str = os.getenv("AZURE_COSMOS_DB_NAME", "VoiceDB")
            self.cosmos_jobs_container: str = f"{prefix}jobs"
            self.cosmos_prompts_container: str = f"{prefix}prompts"

            # Supported Audio Extensions List
            self.supported_audio_extensions = {
                ".wav",  # Default audio streaming format
                ".pcm",  # PCM (Pulse Code Modulation)
                ".mp3",  # MPEG-1 Audio Layer 3
                ".ogg",  # Ogg Vorbis
                ".opus",  # Opus Codec
                ".flac",  # Free Lossless Audio Codec
                ".alaw",  # A-Law in WAV container
                ".mulaw",  # μ-Law in WAV container
                ".mp4",  # MP4 container (ANY format)
                ".wma",  # Windows Media Audio
                ".aac",  # Advanced Audio Codec
                ".amr",  # Adaptive Multi-Rate
                ".webm",  # WebM audio
                ".m4a",  # MPEG-4 Audio
                ".spx",  # Speex Codec
            }

            # Storage settings
            self.storage_account_url: str = os.getenv("AZURE_STORAGE_ACCOUNT_URL")
            self.storage_recordings_container: str = os.getenv(
                "AZURE_STORAGE_RECORDINGS_CONTAINER"
            )

            # Speech settings
            self.speech_max_speakers: int = int(os.getenv("AZURE_SPEECH_MAX_SPEAKERS"))
            self.speech_transcription_locale: str = os.getenv(
                "AZURE_SPEECH_TRANSCRIPTION_LOCALE"
            )

            self.speech_deployment: str = os.getenv("AZURE_SPEECH_DEPLOYMENT")

            # Azure OpenAI settings
            self.azure_openai_endpoint: str = os.getenv("AZURE_OPENAI_ENDPOINT")
            self.azure_openai_deployment: str = os.getenv("AZURE_OPENAI_DEPLOYMENT")
            self.azure_openai_version: str = os.getenv("AZURE_OPENAI_API_VERSION")
            self.speech_candidate_locales: str = os.getenv(
                "AZURE_SPEECH_CANDIDATE_LOCALES"
            )

            logger.debug("AppConfig initialization completed successfully")
        except Exception as e:
            logger.error(f"Error initializing AppConfig: {str(e)}")
            raise
