"""
Dataset Download & Ingestion Module for SalesPulse.
Downloads the canonical Sample Superstore Sales dataset and saves to data/raw/superstore.csv.
"""

import os
import sys
import requests
import pandas as pd
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
RAW_DATA_DIR = BASE_DIR / "data" / "raw"
OUTPUT_FILE = RAW_DATA_DIR / "superstore.csv"

# Primary & Fallback Reliable Sources for Sample Superstore Dataset
DATASET_URLS = [
    "https://raw.githubusercontent.com/praveen-kumar-maurya/Superstore-Sales-Dashboard-Power-BI/main/Sample%20-%20Superstore.csv",
    "https://raw.githubusercontent.com/sumit0072/Superstore-Data-Analysis/main/Sample%20-%20Superstore.csv",
    "https://raw.githubusercontent.com/leonism/sample-superstore/master/data/superstore.csv"
]


def download_dataset() -> Path:
    """Download the dataset from verified sources or verify local file."""
    RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)

    if OUTPUT_FILE.exists() and OUTPUT_FILE.stat().st_size > 1_000_000:
        print(f"Dataset already exists at {OUTPUT_FILE} ({OUTPUT_FILE.stat().st_size:,} bytes).")
        return OUTPUT_FILE

    print(f"Downloading Sample Superstore Dataset to {OUTPUT_FILE}...")
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }

    last_error = None
    for url in DATASET_URLS:
        try:
            print(f"Attempting download from: {url}")
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()

            # Ensure valid CSV content
            content = response.content
            if len(content) > 500_000 and (b"Row ID" in content or b"Order ID" in content):
                with open(OUTPUT_FILE, "wb") as f:
                    f.write(content)
                print(f"Successfully downloaded and saved {len(content):,} bytes to {OUTPUT_FILE}")
                return OUTPUT_FILE
        except Exception as e:
            print(f"Failed to download from {url}: {e}")
            last_error = e

    raise RuntimeError(f"Could not download dataset from any available source: {last_error}")


if __name__ == "__main__":
    download_dataset()

