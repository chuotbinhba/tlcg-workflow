#!/bin/bash

# Script để chạy local web server cho TLCG Intranet
# Cách dùng: ./start-server.sh

cd "/Volumes/MacEx01/TLCG Workflow"

echo "🚀 Starting local web server..."
echo ""
echo "📝 Open in browser:"
echo "   http://localhost:8000/tlcgroup-intranet.html"
echo ""
echo "⚠️  Press Ctrl+C to stop the server"
echo ""

# Try Python 3 first
if command -v python3 &> /dev/null; then
    echo "✅ Using Python 3"
    python3 -m http.server 8000
# Try Python 2
elif command -v python &> /dev/null; then
    echo "✅ Using Python 2"
    python -m SimpleHTTPServer 8000
# Try Node.js http-server
elif command -v http-server &> /dev/null; then
    echo "✅ Using Node.js http-server"
    http-server -p 8000
# Try PHP
elif command -v php &> /dev/null; then
    echo "✅ Using PHP"
    php -S localhost:8000
else
    echo "❌ No web server found!"
    echo ""
    echo "Please install one of:"
    echo "  - Python 3: python3 -m http.server 8000"
    echo "  - Node.js: npm install -g http-server && http-server -p 8000"
    echo "  - PHP: php -S localhost:8000"
    exit 1
fi

