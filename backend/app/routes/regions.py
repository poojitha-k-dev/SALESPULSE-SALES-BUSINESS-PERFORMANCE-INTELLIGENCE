"""
Regional Analytics API Routes for SalesPulse.
"""

from fastapi import APIRouter
from backend.app.schemas.analytics import RegionalPerformanceResponse
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/regions", tags=["Regional Analytics"])


@router.get("/performance", response_model=RegionalPerformanceResponse)
def get_regions_endpoint():
    """
    Retrieve macro regional comparisons, state-level performance rankings,
    loss-making states, and top cities.
    """
    return AnalyticsService.get_regional_analytics()

