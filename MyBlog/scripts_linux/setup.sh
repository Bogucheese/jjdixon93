#!/bin/bash

# Ensure we are in the project root
cd "$(dirname "$0")/.."

echo "=========================================="
echo "   🛠️  MyBlog Linux 一键环境配置"
echo "=========================================="

# 1. Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js (v16+)."
    exit 1
fi
echo "✅ Node.js detected: $(node -v)"

# 2. Install Dependencies
echo ""
echo "📦 [1/3] Installing Server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then echo "❌ Server install failed"; exit 1; fi

echo ""
echo "📦 [2/3] Installing Client dependencies..."
cd ../client
npm install
if [ $? -ne 0 ]; then echo "❌ Client install failed"; exit 1; fi

# 3. Database Setup
echo ""
echo "🗄️  [3/3] Database Setup"
read -p "Do you want to initialize the database now? (y/n): " confirm_db

if [ "$confirm_db" = "y" ]; then
    cd ../server
    if [ ! -f .env ]; then
        echo "⚠️  .env not found. Creating from .env.example..."
        cp .env.example .env
        echo "⚠️  IMPORTANT: Please edit server/.env with your actual DB password!"
        echo "   Then run: ./scripts_linux/init_db.sh"
    else
        npm run db:init
    fi
else
    echo "⏩ Database setup skipped."
fi

echo ""
echo "🎉 Setup Complete!"
echo "Run './scripts_linux/start_dev.sh' to start the project."
