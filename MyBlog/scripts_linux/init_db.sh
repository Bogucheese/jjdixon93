#!/bin/bash

# Ensure we are in the project root
cd "$(dirname "$0")/.."

echo "=========================================="
echo "        🗄️ MyBlog 数据库初始化工具"
echo "=========================================="
echo "This will RESET the database 'myblog'."
echo "ALL DATA WILL BE LOST."

cd server

if [ ! -f .env ]; then
    echo "❌ server/.env not found!"
    echo "Creating from .env.example..."
    cp .env.example .env
    echo "✅ .env created."
    echo "⚠️  PLEASE EDIT server/.env with your DB_PASSWORD before running this again."
    exit 1
fi

npm run db:init
