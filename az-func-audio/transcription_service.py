import logging
import time
from typing import Dict, Any, Optional
import requests
from azure.identity import DefaultAzureCredential
import os
import sys
import json


sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from config import AppConfig
from storage_service import StorageService


class TranscriptionService:
    def __init__(self, config: AppConfig):
        self.config = config
        self.logger = logging.getLogger(__name__)
        self.credential = DefaultAzureCredential()
        self.storage_service = StorageService(config)
        self.endpoint = f"https://{config.speech_deployment}.cognitiveservices.azure.com/speechtotext/v3.2"
        self.logger.info(
            "Initialized TranscriptionService",
            extra={
                "speech_deployment": config.speech_deployment,
                "endpoint": self.endpoint,
                "transcription_locale": config.speech_transcription_locale,
                "max_speakers": config.speech_max_speakers,
            },
        )

    def _get_auth_token(self) -> str:
        """Get authentication token for Azure services"""
        try:
            self.logger.debug(
                "Attempting to acquire authentication token",
                extra={
                    "credential_type": type(self.credential).__name__,
                    "speech_deployment": self.config.speech_deployment,
                    "endpoint": self.endpoint,
                },
            )

            # Log which credential is being tried by DefaultAzureCredential
            if isinstance(self.credential, DefaultAzureCredential):
                self.logger.info(
                    "DefaultAzureCredential authentication sources",
                    extra={
                        "env_vars_present": {
                            "AZURE_CLIENT_ID": bool(os.getenv("AZURE_CLIENT_ID")),
                            "AZURE_TENANT_ID": bool(os.getenv("AZURE_TENANT_ID")),
                            "AZURE_CLIENT_SECRET": bool(
                                os.getenv("AZURE_CLIENT_SECRET")
                            ),
                            "AZURE_USERNAME": bool(os.getenv("AZURE_USERNAME")),
                            "AZURE_PASSWORD": bool(os.getenv("AZURE_PASSWORD")),
                            "AZURE_SUBSCRIPTION_ID": bool(
                                os.getenv("AZURE_SUBSCRIPTION_ID")
                            ),
                        }
                    },
                )

            token = self.credential.get_token(
                "https://cognitiveservices.azure.com/.default"
            )

            self.logger.info(
                "Successfully acquired authentication token",
                extra={
                    "token_expires_on": token.expires_on,
                    "token_length": len(token.token) if token.token else 0,
                    "token_prefix": token.token[:10] + "..." if token.token else None,
                },
            )

            return token.token

        except Exception as e:
            self.logger.error(
                "Failed to acquire authentication token",
                extra={
                    "error_type": type(e).__name__,
                    "error_details": str(e),
                    "credential_type": type(self.credential).__name__,
                },
                exc_info=True,
            )
            raise
        except Exception as e:
            self.logger.error(
                "Failed to acquire authentication token",
                extra={"error_type": type(e).__name__, "error_details": str(e)},
                exc_info=True,
            )
            raise

    def _get_headers(self) -> Dict[str, str]:
        """Get headers for API requests"""
        self.logger.debug("Preparing API request headers")
        token = self._get_auth_token()

        # Create headers
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        }

        # Log header details (safely)
        self.logger.debug(
            "Headers prepared",
            extra={
                "headers_present": {
                    "Content-Type": headers.get("Content-Type"),
                    "Authorization": "Bearer <redacted>",
                    "token_length": len(token) if token else 0,
                }
            },
        )
        return headers

    def _prepare_transcription_properties(self, blob_url: str) -> Dict[str, Any]:
        """Prepare transcription job properties"""
        properties = {
            "contentUrls": [blob_url],
            "locale": self.config.speech_transcription_locale,
            "displayName": f"Transcription_{time.strftime('%Y%m%d_%H%M%S')}",
            "properties": {
                "diarizationEnabled": True,
                "speakers": {
                    "minCount": 1,
                    "maxCount": int(self.config.speech_max_speakers),
                },
                "languageIdentification": {
                    "candidateLocales": self.config.speech_candidate_locales.split(","),
                },
                "profanityFilterMode": "None",
            },
        }
        self.logger.info(
            "Prepared transcription properties",
            extra={
                "display_name": properties["displayName"],
                "locale": properties["locale"],
                "max_speakers": properties["properties"]["speakers"]["maxCount"],
                "candidate_locales": properties["properties"]["languageIdentification"][
                    "candidateLocales"
                ],
            },
        )
        return properties

    def submit_transcription_job(self, blob_url: str) -> str:
        """Submit transcription job and return job ID"""
        try:
            self.logger.info(
                "Submitting transcription job", extra={"blob_url": blob_url}
            )
            properties = self._prepare_transcription_properties(blob_url)
            headers = self._get_headers()

            start_time = time.time()
            response = requests.post(
                f"{self.endpoint}/transcriptions",
                headers=headers,
                json=properties,
                timeout=30,
            )
            request_time = time.time() - start_time

            self.logger.debug(
                "Transcription job submission response received",
                extra={
                    "status_code": response.status_code,
                    "response_time": f"{request_time:.2f}s",
                },
            )

            if response.status_code == 400:
                error_details = response.json()
                self.logger.error(
                    "Bad request error during transcription submission",
                    extra={"error_details": error_details, "request_body": properties},
                )
                raise ValueError(
                    f"Invalid request: {error_details.get('message', 'Unknown error')}"
                )

            response.raise_for_status()
            transcription_id = response.json()["self"].split("/")[-1]
            self.logger.info(
                "Successfully submitted transcription job",
                extra={
                    "transcription_id": transcription_id,
                    "request_time": f"{request_time:.2f}s",
                },
            )
            return transcription_id

        except Exception as e:
            self.logger.error(
                "Failed to submit transcription job",
                extra={
                    "error_type": type(e).__name__,
                    "error_details": str(e),
                    "blob_url": blob_url,
                },
                exc_info=True,
            )
            raise

    def check_status(
        self, transcription_id: str, timeout: int = 18000, interval: int = 20
    ) -> Dict[str, Any]:
        """Check transcription status with timeout"""
        start_time = time.time()
        status_endpoint = f"{self.endpoint}/transcriptions/{transcription_id}"
        headers = self._get_headers()
        check_count = 0

        while True:
            check_count += 1
            elapsed_time = time.time() - start_time

            self.logger.debug(
                "Checking transcription status",
                extra={
                    "transcription_id": transcription_id,
                    "check_count": check_count,
                    "elapsed_time": f"{elapsed_time:.2f}s",
                },
            )

            try:
                response = requests.get(status_endpoint, headers=headers)
                response.raise_for_status()
                status_data = response.json()

                status = status_data.get("status")
                self.logger.info(
                    "Retrieved transcription status",
                    extra={
                        "transcription_id": transcription_id,
                        "status": status,
                        "elapsed_time": f"{elapsed_time:.2f}s",
                    },
                )

                if status == "Succeeded":
                    self.logger.info(
                        "Transcription completed successfully",
                        extra={
                            "transcription_id": transcription_id,
                            "total_checks": check_count,
                            "total_time": f"{elapsed_time:.2f}s",
                        },
                    )
                    return status_data
                elif status == "Failed":
                    error_details = status_data.get("error", {})
                    error_code = error_details.get("code", "Unknown")
                    error_message = error_details.get("message", "Unknown error")
                    error_details_json = status_data.get("properties", {}).get(
                        "error", {}
                    )

                    self.logger.error(
                        "Transcription failed",
                        extra={
                            "transcription_id": transcription_id,
                            "error_code": error_code,
                            "error_message": error_message,
                            "error_details": error_details,
                            "detailed_error": error_details_json,
                            "status_data": status_data,
                            "total_checks": check_count,
                            "total_time": f"{elapsed_time:.2f}s",
                            "last_modified": status_data.get("lastModifiedDateTime"),
                            "created_date": status_data.get("createdDateTime"),
                        },
                        exc_info=True,
                    )
                    raise Exception(
                        f"Transcription failed: Code={error_code}, Message={error_message}, Details={error_details_json}"
                    )
                elif status == "Running":
                    self.logger.info(
                        "Transcription still processing",
                        extra={
                            "transcription_id": transcription_id,
                            "check_count": check_count,
                            "elapsed_time": f"{elapsed_time:.2f}s",
                        },
                    )

                time.sleep(interval)

            except requests.exceptions.RequestException as e:
                self.logger.error(
                    "Error checking transcription status",
                    extra={
                        "transcription_id": transcription_id,
                        "error_type": type(e).__name__,
                        "error_details": str(e),
                        "check_count": check_count,
                        "elapsed_time": f"{elapsed_time:.2f}s",
                    },
                    exc_info=True,
                )
                time.sleep(min(interval * 2, 60))
            except Exception as e:
                self.logger.error(
                    "Unexpected error checking transcription status",
                    extra={
                        "transcription_id": transcription_id,
                        "error_type": type(e).__name__,
                        "error_details": str(e),
                        "check_count": check_count,
                        "elapsed_time": f"{elapsed_time:.2f}s",
                    },
                    exc_info=True,
                )
                raise

    def _format_transcription(self, results: Dict[str, Any]) -> str:
        """Format transcription results as text"""
        formatted_lines = []
        current_speaker = None
        phrase_count = 0
        low_confidence_count = 0

        self.logger.debug("Starting transcription formatting")

        for phrase in results.get("recognizedPhrases", []):
            phrase_count += 1
            speaker = phrase.get("speaker", "Unknown")
            text = phrase.get("nBest", [{}])[0].get("display", "").strip()
            confidence = phrase.get("nBest", [{}])[0].get("confidence", 0)

            if confidence < 0.8:
                low_confidence_count += 1

            if text:
                if speaker != current_speaker:
                    formatted_lines.append(f"\n--- Speaker {speaker} ---")
                    current_speaker = speaker

                line = text
                if confidence < 0.8:
                    line = f"{text} [Confidence: {confidence:.2f}]"

                formatted_lines.append(f"  {line}")

        self.logger.info(
            "Completed transcription formatting",
            extra={
                "total_phrases": phrase_count,
                "low_confidence_phrases": low_confidence_count,
                "unique_speakers": len(
                    set(
                        p.get("speaker", "Unknown")
                        for p in results.get("recognizedPhrases", [])
                    )
                ),
            },
        )

        return "\n".join(formatted_lines)

    def get_results(self, status_data: Dict[str, Any]) -> str:
        """Retrieve transcription results"""
        try:
            files_url = status_data.get("links", {}).get("files")
            if not files_url:
                self.logger.error(
                    "Files URL not found in status data",
                    extra={"status_data": json.dumps(status_data)},
                )
                raise ValueError("Files URL not found in status data")

            self.logger.info("Retrieving transcription files list")
            headers = self._get_headers()

            start_time = time.time()
            files_response = requests.get(files_url, headers=headers)
            files_response.raise_for_status()

            files_data = files_response.json()
            request_time = time.time() - start_time

            self.logger.debug(
                "Retrieved files list",
                extra={
                    "files_count": len(files_data.get("values", [])),
                    "request_time": f"{request_time:.2f}s",
                },
            )

            if not files_data.get("values"):
                self.logger.error("No transcription files found in response")
                raise ValueError("No transcription files found")

            result_url = files_data["values"][0]["links"]["contentUrl"]
            self.logger.info(
                "Retrieving transcription content", extra={"result_url": result_url}
            )

            start_time = time.time()
            result_response = requests.get(result_url)
            result_response.raise_for_status()
            request_time = time.time() - start_time

            transcription_data = result_response.json()
            self.logger.debug(
                "Retrieved transcription content",
                extra={
                    "content_size": len(str(transcription_data)),
                    "request_time": f"{request_time:.2f}s",
                },
            )

            formatted_text = self._format_transcription(transcription_data)
            return formatted_text

        except Exception as e:
            self.logger.error(
                "Failed to retrieve transcription results",
                extra={"error_type": type(e).__name__, "error_details": str(e)},
                exc_info=True,
            )
            raise

    def transcribe(self, blob_url: str) -> Dict[str, Any]:
        """Main transcription workflow"""
        start_time = time.time()

        try:
            self.logger.info(
                "Starting transcription workflow", extra={"blob_url": blob_url}
            )

            # Submit transcription job
            transcription_id = self.submit_transcription_job(blob_url)

            # Wait for completion
            self.logger.info(
                "Waiting for transcription to complete",
                extra={"transcription_id": transcription_id},
            )
            status_data = self.check_status(transcription_id)

            # Get results
            self.logger.info(
                "Retrieving transcription results",
                extra={"transcription_id": transcription_id},
            )
            results = self.get_results(status_data)

            total_time = time.time() - start_time
            self.logger.info(
                "Transcription workflow completed successfully",
                extra={
                    "transcription_id": transcription_id,
                    "total_time": f"{total_time:.2f}s",
                    "result_length": len(results),
                },
            )

            return results

        except Exception as e:
            total_time = time.time() - start_time
            self.logger.error(
                "Transcription workflow failed",
                extra={
                    "error_type": type(e).__name__,
                    "error_details": str(e),
                    "blob_url": blob_url,
                    "total_time": f"{total_time:.2f}s",
                },
                exc_info=True,
            )
            raise
