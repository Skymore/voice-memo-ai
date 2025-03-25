import os
import logging
from typing import Optional, AsyncGenerator
from azure.storage.blob import BlobServiceClient, BlobSasPermissions, generate_blob_sas
from azure.storage.blob.aio import BlobClient as AsyncBlobClient
from azure.identity import DefaultAzureCredential
from azure.core.exceptions import AzureError
from datetime import datetime, timedelta
from urllib.parse import urlparse
from azure.core.exceptions import ResourceNotFoundError
from app.core.config import AppConfig


class StorageService:
    def __init__(self, config: AppConfig):
        self.config = config
        self.logger = logging.getLogger(__name__)
        self.credential = DefaultAzureCredential()

        # Initialize blob service client
        self.blob_service_client = BlobServiceClient(
            account_url=self.config.storage.account_url, credential=self.credential
        )

    def generate_sas_token(self, blob_url: str) -> Optional[str]:
        """Generate SAS token for a blob URL using managed identity"""
        try:
            if not blob_url:
                return None

            # Parse blob URL to get container and blob name
            parsed_url = urlparse(blob_url)
            path_parts = parsed_url.path.strip("/").split("/")
            if len(path_parts) < 2:
                return None

            container_name = path_parts[0]
            blob_name = "/".join(path_parts[1:])

            # Get user delegation key using managed identity
            user_delegation_key = self.blob_service_client.get_user_delegation_key(
                key_start_time=datetime.utcnow() - timedelta(minutes=5),
                key_expiry_time=datetime.utcnow() + timedelta(hours=8),
            )

            # Generate SAS token using user delegation key
            sas_token = generate_blob_sas(
                account_name=parsed_url.netloc.split(".")[0],
                container_name=container_name,
                blob_name=blob_name,
                user_delegation_key=user_delegation_key,
                permission=BlobSasPermissions(read=True),
                expiry=datetime.utcnow() + timedelta(hours=8),
            )

            return sas_token

        except Exception as e:
            self.logger.error(f"Error generating SAS token: {str(e)}")
            return None

    def add_sas_token_to_url(self, blob_url: str) -> str:
        """Add SAS token to blob URL if not already present"""
        if not blob_url:
            return blob_url

        sas_token = self.generate_sas_token(blob_url)
        if sas_token:
            self.logger.debug(f"Adding SAS token to blob URL: {blob_url}")
            return f"{blob_url}?{sas_token}"
        self.logger.debug(f"No SAS token generated for blob URL: {blob_url}")
        return blob_url

    def upload_file(self, file_path: str, original_filename: str) -> str:
        """Upload a file to blob storage"""
        try:
            container_client = self.blob_service_client.get_container_client(
                self.config.storage.recordings_container
            )

            # Generate blob name with date and nested structure
            current_date = datetime.now().strftime("%Y-%m-%d")
            file_name_without_ext = os.path.splitext(original_filename)[0]
            blob_name = f"{current_date}/{file_name_without_ext}/{original_filename}"

            blob_client = container_client.get_blob_client(blob_name)

            # Upload the file
            self.logger.info(f"Uploading file to blob storage: {blob_name}")
            with open(file_path, "rb") as data:
                blob_client.upload_blob(data, overwrite=True)

            return blob_client.url

        except AzureError as e:
            self.logger.error(f"Azure storage error: {str(e)}")
            raise
        except Exception as e:
            self.logger.error(f"Error uploading file: {str(e)}")
            raise

    async def stream_blob_content(
        self, file_blob_url: str
    ) -> AsyncGenerator[bytes, None]:
        """
        Stream content from a blob asynchronously.

        Args:
            file_blob_url (str): URL of the blob to stream.

        Returns:
            AsyncGenerator[bytes, None]: Yields chunks of file content asynchronously.

        Raises:
            ValueError: If the provided URL is invalid or missing required parts.
            ResourceNotFoundError: If the blob does not exist.
            Exception: For other unexpected errors.
        """
        if not file_blob_url:
            raise ValueError("Blob URL cannot be empty.")

        try:
            parsed_url = urlparse(file_blob_url)
            if not parsed_url.path:
                raise ValueError("Invalid blob URL: Missing path.")

            # Extract the blob name from the URL
            if self.config.storage.recordings_container not in parsed_url.path:
                raise ValueError(
                    f"Blob URL does not contain the expected container: {self.config.storage.recordings_container}"
                )

            blob_name = parsed_url.path.split(
                self.config.storage.recordings_container, 1
            )[-1].lstrip("/")
            self.logger.debug(f"Extracted blob name: {blob_name}")

            # Create an async blob client
            async_blob_client = AsyncBlobClient(
                account_url=self.config.storage.account_url,
                container_name=self.config.storage.recordings_container,
                blob_name=blob_name,
                credential=self.credential,
            )

            # Stream the blob content in chunks
            async with async_blob_client:
                # Get the downloader without specifying chunk size
                # The chunks() method doesn't accept a chunk_size parameter
                downloader = await async_blob_client.download_blob()

                # Stream the chunks as they come
                async for chunk in downloader.chunks():
                    yield chunk

        except ValueError as ve:
            self.logger.warning(f"Validation error: {ve}")
            raise
        except ResourceNotFoundError as rnfe:
            self.logger.error(f"Blob not found: {rnfe}")
            raise
        except Exception as e:
            self.logger.error(
                f"Unexpected error streaming blob content: {str(e)}", exc_info=True
            )
            raise
