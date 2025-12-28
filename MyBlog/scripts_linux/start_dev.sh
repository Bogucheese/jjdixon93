#!/bin/bash

# Ensure we are in the project root
cd "$(dirname "$0")/.."

echo "=========================================="
echo "       🚀 MyBlog 开发环境启动中..."
echo "=========================================="

# Function to handle cleanup on exit
cleanup() {
    echo "Stopping services..."
    kill $(jobs -p) 2>/dev/null
}
trap cleanup EXIT

echo "Starting Backend (Port 3000)..."
cd server && npm start &

echo "Waiting for backend..."
sleep 3

echo "Starting Frontend (Port 5173)..."
cd ../client && npm run dev &

echo ""
echo "✅ Services started!"
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:5173"
echo "Press Ctrl+C to stop."

wait
