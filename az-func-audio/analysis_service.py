from typing import Dict, Any
import requests
import logging
from azure.identity import DefaultAzureCredential
from config import AppConfig

logger = logging.getLogger(__name__)


class AnalysisService:
    def __init__(self, config: AppConfig):
        self.config = config
        self.credential = DefaultAzureCredential()

    def analyze_conversation(self, conversation: str, context: str) -> Dict[str, Any]:
        """
        Analyze conversation using Azure OpenAI.

        Args:
            conversation: The conversation text to analyze
            context: The system context/prompt for analysis

        Returns:
            Dict containing the analysis results
        """
        try:
            token = self.credential.get_token(
                "https://cognitiveservices.azure.com/.default"
            )

            api_url = (
                f"{self.config.azure_openai_endpoint}openai/deployments/"
                f"{self.config.azure_openai_deployment}/chat/completions"
                f"?api-version={self.config.azure_openai_version}"
            )

            headers = {
                "Authorization": f"Bearer {token.token}",
                "Content-Type": "application/json",
            }

            payload = {
                "messages": [
                    {"role": "system", "content": context},
                    {"role": "user", "content": conversation},
                ],
                "temperature": 0.7,
            }

            logger.info("Sending analysis request to Azure OpenAI")
            response = requests.post(api_url, headers=headers, json=payload)
            response.raise_for_status()

            result = response.json()
            analysis_text = result["choices"][0]["message"]["content"]

            return {
                "analysis_text": analysis_text,
                "raw_response": result,
                "status": "success",
            }

        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}")
            return {"status": "error", "error": str(e)}

    def process_transcription_results(
        self, transcription_result: Dict[str, Any], context: str
    ) -> Dict[str, Any]:
        """
        Process transcription results and perform analysis.

        Args:
            transcription_result: The transcription results to analyze
            context: The analysis context/prompt

        Returns:
            Dict containing the analysis results
        """
        try:
            # Extract conversation text from transcription
            conversation_text = transcription_result.get(
                "combinedRecognizedPhrases", [{}]
            )[0].get("display", "")
            if not conversation_text:
                raise ValueError("No conversation text found in transcription results")

            # Perform analysis
            analysis_result = self.analyze_conversation(conversation_text, context)

            return {
                "transcription": conversation_text,
                "analysis": analysis_result,
                "status": "success",
            }

        except Exception as e:
            logger.error(f"Failed to process transcription results: {str(e)}")
            return {"status": "error", "error": str(e)}
