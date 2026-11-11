"""
Product Performance API Routes for SalesPulse.
"""

from typing import Optional
from fastapi import APIRouter, Query
from backend.app.schemas.analytics import ProductPerformanceResponse
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/products", tags=["Product Analytics"])


@router.get("/performance", response_model=ProductPerformanceResponse)
def get_products_endpoint(
    limit: int = Query(15, ge=1, le=100, description="Number of ranked products to return")
):
    """
    Retrieve product category breakdown, sub-category performance, top revenue products,
    top profit products, loss-making products, and high-revenue low-margin traps.
    """
    return AnalyticsService.get_product_analytics(limit=limit)

