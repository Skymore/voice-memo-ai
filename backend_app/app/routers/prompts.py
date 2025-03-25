from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional
from pydantic import BaseModel
import logging
from datetime import datetime, timezone

from app.core.config import AppConfig, CosmosDB, DatabaseError
from app.routers.auth import get_current_user

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
router = APIRouter()


class PromptKey(BaseModel):
    key: str
    prompt: str


class Subcategory(BaseModel):
    name: str
    prompts: Dict[str, str]


class Category(BaseModel):
    name: str
    subcategories: Dict[str, Dict[str, str]]


from fastapi import HTTPException, Depends
from datetime import datetime, timezone
from typing import Dict, Any


@router.post("/create_prompt")
async def create_prompt(
    category: Category,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Create or update a prompt category with its subcategories and prompts"""
    try:
        config = AppConfig()
        try:
            cosmos_db = CosmosDB(config)
            logger.debug("CosmosDB client initialized for upload")
        except DatabaseError as e:
            logger.error(f"Database initialization failed: {str(e)}")
            return {"status": 503, "message": "Database service unavailable"}

        timestamp = int(datetime.now(timezone.utc).timestamp() * 1000)

        # Check if the category already exists
        existing_category_query = {
            "query": "SELECT * FROM c WHERE c.type = 'prompt_category' AND c.name = @name",
            "parameters": [{"name": "@name", "value": category.name}],
        }
        existing_categories = list(
            cosmos_db.prompts_container.query_items(  # Use prompts_container
                query=existing_category_query["query"],
                parameters=existing_category_query["parameters"],
                enable_cross_partition_query=True,
            )
        )

        if existing_categories:
            category_data = existing_categories[0]
            category_id = category_data["id"]
            category_data["updated_at"] = timestamp
            cosmos_db.prompts_container.upsert_item(
                category_data
            )  # Use prompts_container
        else:
            category_id = f"category_{timestamp}"
            category_data = {
                "id": category_id,
                "type": "prompt_category",
                "name": category.name,
                "created_at": timestamp,
                "updated_at": timestamp,
            }
            cosmos_db.prompts_container.upsert_item(
                category_data
            )  # Use prompts_container

        # Process subcategories and prompts
        for subcategory_name, prompts in category.subcategories.items():
            subcategory_query = {
                "query": "SELECT * FROM c WHERE c.type = 'prompt_subcategory' AND c.category_id = @category_id AND c.name = @name",
                "parameters": [
                    {"name": "@category_id", "value": category_id},
                    {"name": "@name", "value": subcategory_name},
                ],
            }
            existing_subcategories = list(
                cosmos_db.prompts_container.query_items(  # Use prompts_container
                    query=subcategory_query["query"],
                    parameters=subcategory_query["parameters"],
                    enable_cross_partition_query=True,
                )
            )

            if existing_subcategories:
                subcategory_data = existing_subcategories[0]
                subcategory_id = subcategory_data["id"]
                subcategory_data["updated_at"] = timestamp
                for prompt_key, prompt_text in prompts.items():
                    subcategory_data["prompts"][prompt_key] = (
                        prompt_text  # Update or add prompt
                    )
                cosmos_db.prompts_container.upsert_item(
                    subcategory_data
                )  # Use prompts_container
            else:
                subcategory_id = f"subcategory_{timestamp}_{subcategory_name}"
                subcategory_data = {
                    "id": subcategory_id,
                    "type": "prompt_subcategory",
                    "category_id": category_id,
                    "name": subcategory_name,
                    "prompts": {key: text for key, text in prompts.items()},
                    "created_at": timestamp,
                    "updated_at": timestamp,
                }
                cosmos_db.prompts_container.upsert_item(
                    subcategory_data
                )  # Use prompts_container

        return {
            "status": 200,
            "message": f"Category '{category.name}' processed successfully",
            "category_id": category_id,
        }

    except Exception as e:
        logger.error(f"Error processing prompt category: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process prompt category: {str(e)}",
        )


@router.get("/retrieve_prompts")
async def retrieve_prompts(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Retrieve all prompts, categories, and subcategories"""
    try:
        config = AppConfig()
        try:
            cosmos_db = CosmosDB(config)
            logger.debug("CosmosDB client initialized for retrieval")
        except DatabaseError as e:
            logger.error(f"Database initialization failed: {str(e)}")
            return {"status": 503, "message": "Database service unavailable"}

        # Query all categories
        categories_query = "SELECT * FROM c WHERE c.type = 'prompt_category'"
        categories = list(
            cosmos_db.prompts_container.query_items(
                query=categories_query, enable_cross_partition_query=True
            )
        )

        # Query all subcategories
        subcategories_query = "SELECT * FROM c WHERE c.type = 'prompt_subcategory'"
        subcategories = list(
            cosmos_db.prompts_container.query_items(
                query=subcategories_query, enable_cross_partition_query=True
            )
        )

        # Organize data
        results = []
        for category in categories:
            category_data = {
                "category_name": category["name"],
                "category_id": category["id"],
                "subcategories": [],
            }
            for subcategory in subcategories:
                if subcategory["category_id"] == category["id"]:
                    category_data["subcategories"].append(
                        {
                            "subcategory_name": subcategory["name"],
                            "subcategory_id": subcategory["id"],
                            "prompts": subcategory["prompts"],
                        }
                    )
            results.append(category_data)

        return {"status": 200, "data": results}

    except Exception as e:
        logger.error(f"Error retrieving prompts: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve prompts: {str(e)}",
        )
