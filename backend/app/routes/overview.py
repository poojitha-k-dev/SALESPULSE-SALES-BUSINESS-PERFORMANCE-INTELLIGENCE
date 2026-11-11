"""
Executive Overview API Routes for SalesPulse.
"""

from typing import Optional
from fastapi import APIRouter, Query
from backend.app.schemas.analytics import OverviewResponse
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/overview", tags=["Executive Overview"])


@router.get("", response_model=OverviewResponse)
def get_overview_metrics(
    year: Optional[int] = Query(None, description="Filter by Order Year (e.g. 2017)"),
    region: Optional[str] = Query(None, description="Filter by Region (West, East, Central, South)"),
    category: Optional[str] = Query(None, description="Filter by Category"),
    segment: Optional[str] = Query(None, description="Filter by Customer Segment"),
    start_date: Optional[str] = Query(None, description="Start Date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End Date (YYYY-MM-DD)")
):
    """
    Retrieve comprehensive Executive Overview metrics including KPIs, monthly trends,
    category distribution, regional contribution, and top products.
    """
    return AnalyticsService.get_overview(
        year=year,
        region=region,
        category=category,
        segment=segment,
        start_date=start_date,
        end_date=end_date
    )
