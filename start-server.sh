#!/bin/bash

# SuperClaude Local Development Server
echo "🚀 Starting SuperClaude development server..."

# Kill any existing servers
pkill -f "python.*http.server" 2>/dev/null || true

# Start fresh server
cd "$(dirname "$0")"
echo "📁 Serving from: $(pwd)"
echo "🌐 Server will be available at: http://localhost:8000"
echo "📄 Direct link: http://localhost:8000/index.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 -m http.server 8000