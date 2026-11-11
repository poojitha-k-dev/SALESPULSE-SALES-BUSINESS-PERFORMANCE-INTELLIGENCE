"""
SalesPulse – Sales & Business Performance Intelligence
FastAPI Enterprise REST API Server.
"""

import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from backend.app.routes import (
    overview,
    sales,
    products,
    regions,
    profitability,
    customers,
    insights,
    pipeline,
    explorer
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")

app = FastAPI(
    title="SalesPulse Intelligence API",
    description="Enterprise REST API for Sales & Business Performance Intelligence platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(overview.router)
app.include_router(sales.router)
app.include_router(products.router)
app.include_router(regions.router)
app.include_router(profitability.router)
app.include_router(customers.router)
app.include_router(insights.router)
app.include_router(pipeline.router)
app.include_router(explorer.router)


@app.get("/health", tags=["Health & Status"])
def health_check():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "service": "SalesPulse Intelligence API",
        "version": "1.0.0",
        "database": "salespulse_db connected"
    }


@app.get("/", tags=["Health & Status"])
def root():
    return {
        "product": "SalesPulse – Sales & Business Performance Intelligence",
        "tagline": "Transform Sales Data Into Smarter Business Decisions.",
        "documentation": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
