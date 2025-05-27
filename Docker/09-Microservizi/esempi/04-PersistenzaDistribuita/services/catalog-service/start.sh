#!/bin/bash
# filepath: /home/git-projects/ROBOTICA/Docker/09-Microservizi/esempi/04-PersistenzaDistribuita/services/catalog-service/start.sh

# Start script for catalog service

echo "Starting Catalog Service..."

# Check if virtual environment exists, create if not
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Wait for dependencies (Elasticsearch, Redis, Kafka)
echo "Waiting for Elasticsearch..."
while ! curl -s http://localhost:9200/_cluster/health > /dev/null; do
    sleep 2
done

echo "Waiting for Redis..."
while ! redis-cli ping > /dev/null 2>&1; do
    sleep 2
done

echo "Waiting for Kafka..."
while ! nc -z localhost 9092; do
    sleep 2
done

# Initialize Elasticsearch indices
echo "Initializing search indices..."
python -c "
import asyncio
from services.search_service import SearchService

async def init_indices():
    search_service = SearchService()
    await search_service.create_search_indices()
    await search_service.close()

asyncio.run(init_indices())
"

# Start the service
echo "Starting Catalog Service on port 8003..."
uvicorn main:app --host 0.0.0.0 --port 8003 --reload
