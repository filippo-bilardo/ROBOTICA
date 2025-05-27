#!/bin/bash
set -e

echo "🏗️  Building optimized Node.js application..."

# Build with cache optimization
DOCKER_BUILDKIT=1 docker build \
  --target=production \
  --tag=nodejs-optimized:latest \
  --cache-from=nodejs-optimized:cache \
  --cache-to=type=local,dest=/tmp/docker-cache \
  -f Dockerfile.optimized \
  .

# Test the built image
echo "🧪 Testing the built image..."
docker run --rm -d --name test-app -p 3000:3000 nodejs-optimized:latest

# Wait for app to start
sleep 5

# Health check
if curl -f http://localhost:3000/health; then
  echo "✅ Health check passed!"
else
  echo "❌ Health check failed!"
  exit 1
fi

# Cleanup test container
docker stop test-app || true

echo "🎉 Build and test completed successfully!"
