#!/usr/bin/env python3
# filepath: /home/git-projects/ROBOTICA/Docker/09-Microservizi/esempi/04-PersistenzaDistribuita/services/catalog-service/healthcheck.py
import sys
import asyncio
import httpx
from config import settings

async def check_health():
    """Check if the catalog service is healthy"""
    try:
        timeout = httpx.Timeout(5.0, connect=5.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.get(f"http://localhost:{settings.PORT}/health")
            
            if response.status_code == 200:
                print("Catalog service is healthy")
                return True
            else:
                print(f"Catalog service unhealthy: HTTP {response.status_code}")
                return False
                
    except Exception as e:
        print(f"Catalog service health check failed: {e}")
        return False

if __name__ == "__main__":
    if asyncio.run(check_health()):
        sys.exit(0)
    else:
        sys.exit(1)
