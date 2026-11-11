"""
Customer Analytics API Routes for SalesPulse.
"""

from fastapi import APIRouter
from backend.app.schemas.analytics import CustomerAnalyticsResponse
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/customers", tags=["Customer Analytics"])


@router.get("/analytics", response_model=CustomerAnalyticsResponse)
def get_customers_endpoint():
    """
    Retrieve customer segment comparisons, top customers by revenue and profit,
    loss-generating clients, Pareto 80/20 distribution, and purchase frequencies.
    """
    return AnalyticsService.get_customer_analytics()
