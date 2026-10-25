#!/bin/bash
set -e

APP_NAME="node-cicd-app"
CONTAINER_NAME="node-cicd-app-container"
PORT=3000

echo "=========================================="
echo "🚀 Jenkins CI/CD Deployment Starting..."
echo "=========================================="

echo "[1/3] 🔨 Building Docker image: ${APP_NAME}..."
docker build -t ${APP_NAME}:latest .

echo "[2/3] 🛑 Stopping existing container (if running)..."
if [ "$(docker ps -aq -f name=^/${CONTAINER_NAME}$)" ]; then
    echo "Found running container '${CONTAINER_NAME}'. Stopping and removing..."
    docker stop ${CONTAINER_NAME} || true
    docker rm ${CONTAINER_NAME} || true
else
    echo "No existing container found with name '${CONTAINER_NAME}'. Continuing..."
fi

echo "[3/3] 🚢 Deploying new container on port ${PORT}..."
docker run -d \
    --name ${CONTAINER_NAME} \
    -p ${PORT}:3000 \
    --restart unless-stopped \
    ${APP_NAME}:latest

echo "=========================================="
echo "✅ CI/CD Pipeline Completed Successfully!"
echo "🌐 Application is live at: http://localhost:${PORT}"
echo "=========================================="
