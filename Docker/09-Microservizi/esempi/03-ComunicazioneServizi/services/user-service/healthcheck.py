import sys
import asyncio
import httpx

async def health_check():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:3000/health", timeout=5.0)
            if response.status_code == 200:
                health_data = response.json()
                if health_data.get("status") == "healthy":
                    sys.exit(0)
                else:
                    print(f"Service unhealthy: {health_data}")
                    sys.exit(1)
            else:
                print(f"Health check failed with status: {response.status_code}")
                sys.exit(1)
    except Exception as e:
        print(f"Health check failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(health_check())
