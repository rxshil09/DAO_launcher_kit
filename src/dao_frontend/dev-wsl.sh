#!/bin/bash

# WSL-friendly development script for DAO Frontend
# This script helps resolve common WSL development issues

echo "🚀 Starting DAO Frontend Development (WSL Optimized)"

# Clean any existing cache that might cause permission issues
echo "🧹 Cleaning Vite cache..."
rm -rf node_modules/.vite .vite-cache 2>/dev/null || true

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Set proper permissions for WSL
echo "🔧 Setting permissions..."
chmod -R 755 . 2>/dev/null || true

# Start development server with WSL-optimized settings
echo "🏃 Starting development server..."
echo "   Local:   http://localhost:5173/"
echo "   Network: http://$(hostname -I | awk '{print $1}'):5173/"
echo ""
echo "💡 If you still see permission errors, try running from WSL terminal:"
echo "   cd /mnt/d/Desktop/Hackathons/WCHL/DAO-8\\ september/DAO_launcher_kit/src/dao_frontend"
echo "   npm run dev:clean"
echo ""

# Start Vite with environment variables for better WSL support
VITE_WSL=true npm run dev
