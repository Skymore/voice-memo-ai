import os
import azure.functions as func
import logging
from datetime import datetime
from config import AppConfig
from transcription_service import TranscriptionService
from analysis_service import AnalysisService
from storage_service import StorageService
from cosmos_service import CosmosService

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

app = func.FunctionApp()


@app.blob_trigger(
    arg_name="myblob",
    path="%AZURE_STORAGE_RECORDINGS_CONTAINER%/{name}",
    connection="audio",
)
def blob_trigger(myblob: func.InputStream):
    logging.debug("Entered process_audio_file function")
    try:
        # Initialize services
        logging.debug("Initializing configuration and services...")

        config = AppConfig()
        blob_path = myblob.name
        # Define allowed audio extensions

        # Extract the file extension
        blob_path_without_extension, blob_extension = os.path.splitext(blob_path)

        # Check if the file has a valid audio extension
        if blob_extension not in config.supported_audio_extensions:
            logging.info(
                f"Skipping file '{myblob.name}' (unsupported extension: {blob_extension})"
            )
            return

        # Remove the container name (recordingcontainer) from the path

        path_without_container = blob_path_without_extension[
            len(config.storage_recordings_container) + 1 :
        ]  # Strip "recordingcontainer/" from the path

        # Logging results
        logging.info(f"Full Blob Path: {blob_path}")
        logging.info(f"Blob Path Without Extension: {blob_path_without_extension}")
        logging.info(f"Blob Extension: {blob_extension}")
        logging.info(f"Path Without Container: {path_without_container}")

        cosmos_service = CosmosService(config)
        transcription_service = TranscriptionService(config)
        analysis_service = AnalysisService(config)
        storage_service = StorageService(config)

        blob_url = f"{config.storage_account_url}/{myblob.name}"

        # Get file name and retrieve file document
        logging.info(f"Processing file: {blob_path}")

        logging.debug("Retrieving file document from CosmosDB...")
        file_doc = cosmos_service.get_file_by_blob_url(blob_url)
        if not file_doc:
            logging.error(f"File document not found for: {blob_path}")
            raise ValueError(f"File document not found: {blob_path}")

        job_id = file_doc["id"]
        logging.debug(f"File document retrieved successfully: Job ID = {job_id}")

        # 1. Start transcription
        logging.info("Starting transcription process...")
        transcription_id = transcription_service.submit_transcription_job(blob_url)
        logging.debug(
            f"Transcription job submitted: Transcription ID = {transcription_id}"
        )

        # Update job status to transcribing
        cosmos_service.update_job_status(
            job_id, "transcribing", transcription_id=transcription_id
        )
        logging.debug(f"Job status updated to 'transcribing' for Job ID = {job_id}")

        # 2. Wait for transcription completion
        logging.info("Waiting for transcription to complete...")
        status_data = transcription_service.check_status(transcription_id)
        logging.debug("Transcription status checked successfully")

        formatted_text = transcription_service.get_results(status_data)
        logging.debug("Transcription results retrieved and formatted")

        # Save transcription text
        logging.info("Uploading transcription text to storage...")
        transcription_blob_url = storage_service.upload_text(
            container_name=config.storage_recordings_container,
            blob_name=f"{path_without_container}_transcription.txt",
            text_content=formatted_text,
        )
        logging.debug(f"Transcription text uploaded: {transcription_blob_url}")

        # Update job with transcription complete
        cosmos_service.update_job_status(
            job_id, "transcribed", transcription_file_path=transcription_blob_url
        )
        logging.debug(f"Job status updated to 'transcribed' for Job ID = {job_id}")

        # 3. Get analysis prompts
        logging.info("Retrieving analysis prompts...")
        prompt_text = cosmos_service.get_prompts(file_doc["prompt_subcategory_id"])
        if not prompt_text:
            logging.error("No prompts found for analysis")
            raise ValueError("No prompts found")
        logging.debug("Analysis prompts retrieved successfully")

        # 4. Analyze transcription
        logging.info("Starting analysis of transcription...")
        analysis_result = analysis_service.analyze_conversation(
            formatted_text, prompt_text
        )
        logging.debug("Analysis completed successfully")

        # 5. Generate and upload PDF
        logging.info("Generating and uploading analysis PDF...")
        pdf_blob_url = storage_service.generate_and_upload_pdf(
            analysis_result["analysis_text"],
            f"{path_without_container}_analysis.pdf",
        )
        logging.debug(f"Analysis PDF uploaded: {pdf_blob_url}")

        # 6. Final update to job
        cosmos_service.update_job_status(
            job_id,
            "completed",
            analysis_file_path=pdf_blob_url,
            analysis_text=analysis_result["analysis_text"],
        )
        logging.info(f"Processing completed successfully for file: {blob_path}")

    except Exception as e:
        logging.error(f"Error processing file: {str(e)}", exc_info=True)
        if "job_id" in locals():
            cosmos_service.update_job_status(job_id, "failed", error_message=str(e))
        raise
