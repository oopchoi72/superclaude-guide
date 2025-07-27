#!/usr/bin/env python3
"""
Simple HTTP server for testing Service Worker locally
"""
import http.server
import socketserver
import os
import sys
from pathlib import Path

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add Service Worker headers
        if self.path.endswith('.js'):
            self.send_header('Content-Type', 'application/javascript')
        if self.path.endswith('/sw.js') or self.path.endswith('sw.js'):
            self.send_header('Service-Worker-Allowed', '/')
        super().end_headers()
    
    def log_message(self, format, *args):
        # Custom logging
        print(f"[{self.date_time_string()}] {format % args}")

def main():
    port = 8080
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    
    # Change to script directory
    os.chdir(Path(__file__).parent)
    
    with socketserver.TCPServer(("", port), CustomHTTPRequestHandler) as httpd:
        print(f"🚀 Starting server at http://localhost:{port}")
        print(f"📁 Serving files from: {os.getcwd()}")
        print(f"🔧 Service Worker test: http://localhost:{port}/test-sw.html")
        print(f"🐛 Debug page: http://localhost:{port}/sw-debug.html")
        print(f"📄 Main site: http://localhost:{port}")
        print("\nPress Ctrl+C to stop")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Server stopped")

if __name__ == "__main__":
    main()