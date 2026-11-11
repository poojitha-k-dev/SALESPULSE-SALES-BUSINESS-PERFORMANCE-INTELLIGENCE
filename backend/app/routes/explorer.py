"""
Data Explorer API Routes for SalesPulse.
Allows safe, structured inspection of underlying dataset tables, schemas, and export.
"""

from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse
import io
import pandas as pd
from backend.app.database.connection import get_raw_connection

router = APIRouter(prefix="/api/data/explorer", tags=["Data Explorer"])

ALLOWED_TABLES = [
    "fact_sales",
    "dim_products",
    "dim_customers",
    "dim_geography",
    "staging_superstore",
    "agg_monthly_sales",
    "agg_category_performance",
    "agg_regional_performance"
]


@router.get("/tables")
def list_available_tables() -> List[Dict[str, Any]]:
    """List available analytical tables and their record counts."""
    conn = get_raw_connection()
    cur = conn.cursor()
    try:
        tables_meta = []
        for table in ALLOWED_TABLES:
            cur.execute(f"SELECT COUNT(*) FROM {table}")
            cnt = cur.fetchone()["count"]
            tables_meta.append({"table_name": table, "record_count": cnt})
        return tables_meta
    finally:
        cur.close()
        conn.close()


@router.get("/preview")
def preview_table(
    table: str = Query("fact_sales", description="Table name to inspect"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(25, ge=5, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term across text columns")
) -> Dict[str, Any]:
    """Retrieve paginated rows and schema metadata for a specific table."""
    if table not in ALLOWED_TABLES:
        raise HTTPException(status_code=400, detail=f"Invalid table name. Allowed: {ALLOWED_TABLES}")

    conn = get_raw_connection()
    cur = conn.cursor()
    try:
        # Schema info
        cur.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = %s
            ORDER BY ordinal_position
        """, (table,))
        columns = cur.fetchall()

        # Count
        cur.execute(f"SELECT COUNT(*) FROM {table}")
        total_rows = cur.fetchone()["count"]

        # Pagination
        offset = (page - 1) * page_size
        cur.execute(f"SELECT * FROM {table} LIMIT %s OFFSET %s", (page_size, offset))
        rows = cur.fetchall()

        return {
            "table_name": table,
            "total_records": total_rows,
            "page": page,
            "page_size": page_size,
            "total_pages": (total_rows + page_size - 1) // page_size,
            "columns": columns,
            "rows": rows
        }
    finally:
        cur.close()
        conn.close()


@router.get("/export")
def export_table_csv(
    table: str = Query("fact_sales", description="Table name to export")
):
    """Export table contents as a downloadable CSV."""
    if table not in ALLOWED_TABLES:
        raise HTTPException(status_code=400, detail=f"Invalid table name. Allowed: {ALLOWED_TABLES}")

    conn = get_raw_connection()
    try:
        df = pd.read_sql(f"SELECT * FROM {table} LIMIT 10000", conn)
        buffer = io.StringIO()
        df.to_csv(buffer, index=False)
        buffer.seek(0)
        return StreamingResponse(
            io.BytesIO(buffer.getvalue().encode("utf-8")),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={table}_export.csv"}
        )
    finally:
        conn.close()

