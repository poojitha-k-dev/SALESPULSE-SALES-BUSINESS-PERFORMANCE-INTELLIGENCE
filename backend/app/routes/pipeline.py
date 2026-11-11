"""
Pipeline Monitoring & Execution API Routes for SalesPulse.
"""

from fastapi import APIRouter
from backend.app.schemas.analytics import PipelineStatusResponse, DataQualityResponse
from backend.app.services.pipeline_service import PipelineService

router = APIRouter(prefix="/api", tags=["Pipeline & Data Quality"])


@router.get("/pipeline/status", response_model=PipelineStatusResponse)
def get_pipeline_status_endpoint():
    """
    Check the current execution status, database tables, and n8n webhook sync.
    """
    return PipelineService.get_pipeline_status()


@router.post("/pipeline/run")
def trigger_pipeline_run_endpoint():
    """
    Trigger immediate execution of the data cleaning, validation, and PostgreSQL ETL process.
    """
    return PipelineService.run_pipeline()


@router.get("/data/quality", response_model=DataQualityResponse)
def get_data_quality_endpoint():
    """
    Retrieve current data validation results and quality score.
    """
    return PipelineService.get_data_quality_report()
