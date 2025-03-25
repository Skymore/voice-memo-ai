import logging
import mimetypes
import os
import shutil
from datetime import datetime, timedelta
from typing import Tuple


class FileUtils:
    AUDIO_EXTENSIONS = {
        "wav": "audio/wav",
        "mp3": "audio/mpeg",
        "m4a": "audio/mp4",
        "aac": "audio/aac",
        "ogg": "audio/ogg",
        "flac": "audio/flac",
    }

    def __init__(self):
        self.logger = logging.getLogger(__name__)

    @classmethod
    def get_extension(cls, filename: str) -> str:
        """Get clean file extension without dot"""
        extension = filename.split(".")[-1].lower() if "." in filename else ""
        return extension.lstrip(".")

    @classmethod
    def clean_temp_files(cls, temp_dir: str, max_age_hours: int = 24) -> None:
        """Clean up temporary files older than specified hours"""
        if not os.path.exists(temp_dir):
            return

        current_time = datetime.now()
        for filename in os.listdir(temp_dir):
            filepath = os.path.join(temp_dir, filename)
            if os.path.isfile(filepath):
                file_modified = datetime.fromtimestamp(os.path.getmtime(filepath))
                if current_time - file_modified > timedelta(hours=max_age_hours):
                    try:
                        os.remove(filepath)
                        logging.info(f"Removed old temp file: {filepath}")
                    except Exception as e:
                        logging.error(f"Error removing temp file {filepath}: {str(e)}")

    @classmethod
    def validate_audio_file(
        cls, file_path: str, max_size_mb: int = 500
    ) -> Tuple[bool, str]:
        """Validate audio file format and size"""
        try:
            # Check if file exists
            if not os.path.exists(file_path):
                return False, "File does not exist"

            # Check file extension
            _, file_extension = os.path.splitext(file_path)
            file_extension = file_extension.replace(".", "").lower()

            if file_extension not in cls.AUDIO_EXTENSIONS:
                return (
                    False,
                    f"Unsupported file format '{file_extension}'. "
                    f"Supported formats: {', '.join(cls.AUDIO_EXTENSIONS.keys())}",
                )

            return True, "File is valid"

        except Exception as e:
            return False, f"Error validating file: {str(e)}"

    @classmethod
    def get_safe_temp_path(cls, original_filename: str, temp_dir: str = "temp") -> str:
        """Generate a safe temporary file path"""
        if not os.path.exists(temp_dir):
            os.makedirs(temp_dir)

        base_name = os.path.splitext(original_filename)[0]
        extension = os.path.splitext(original_filename)[1].lower()
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_filename = f"{base_name}_{timestamp}{extension}"
        return os.path.join(temp_dir, safe_filename)

    @classmethod
    def ensure_directory_exists(cls, directory: str) -> None:
        """Ensure the specified directory exists"""
        if not os.path.exists(directory):
            os.makedirs(directory)
            logging.info(f"Created directory: {directory}")
