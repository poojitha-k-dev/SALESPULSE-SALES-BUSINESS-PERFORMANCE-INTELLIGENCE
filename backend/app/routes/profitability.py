"""
Profitability Analytics API Routes for SalesPulse.
"""

from fastapi import APIRouter
from backend.app.schemas.analytics import ProfitabilityResponse
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/profitability", tags=["Profitability Analytics"])


@router.get("", response_model=ProfitabilityResponse)
def get_profitability_endpoint():
    """
    Retrieve profitability breakdown, discount tier impact, discount bin margins,
    loss subcategories, and correlation analysis.
    """
    return AnalyticsService.get_profitability_analytics()

