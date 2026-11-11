"""
Sales Analytics API Routes for SalesPulse.
"""

from typing import Optional
from fastapi import APIRouter, Query
from backend.app.schemas.analytics import SalesTrendResponse
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/sales", tags=["Sales Analytics"])


@router.get("/trends", response_model=SalesTrendResponse)
def get_sales_trends_endpoint(
    year: Optional[int] = Query(None, description="Optional year filter"),
    region: Optional[str] = Query(None, description="Optional region filter"),
    category: Optional[str] = Query(None, description="Optional category filter")
):
    """
    Retrieve deep sales performance trends including monthly, quarterly, annual YoY,
    day-of-week seasonality, and month seasonality metrics.
    """
    return AnalyticsService.get_sales_analytics(year=year, region=region, category=category)

