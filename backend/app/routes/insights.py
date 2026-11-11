"""
Strategic Business Insights API Routes for SalesPulse.
"""

from typing import List
from fastapi import APIRouter
from backend.app.schemas.analytics import StrategicInsight
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/insights", tags=["Business Insights"])


@router.get("", response_model=List[StrategicInsight])
def get_strategic_insights_endpoint():
    """
    Retrieve empirical, evidence-based business insights and prioritized strategic directives.
    """
    return AnalyticsService.get_strategic_insights()

