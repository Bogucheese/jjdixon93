#!/bin/bash

# Ensure we are in the project root
cd "$(dirname "$0")/.."

echo "⚠️  Warning: This will delete node_modules and reinstall everything."
read -p "Press Enter to continue or Ctrl+C to cancel..."

echo "[1/4] Cleaning Server..."
rm -rf server/node_modules server/package-lock.json

echo "[2/4] Cleaning Client..."
rm -rf client/node_modules client/package-lock.json

echo "[3/4] Reinstalling Server..."
cd server && npm install

echo "[4/4] Reinstalling Client..."
cd ../client && npm install

echo "✅ Done!"
