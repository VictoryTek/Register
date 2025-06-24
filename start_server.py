import http.server
import socketserver
import os
import webbrowser
import threading
import time

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_GET(self):
        # Serve the demo HTML file for any request
        if self.path == '/' or self.path == '/index.html':
            self.path = '/inventory-demo.html'
        elif self.path.startswith('/catalog') or self.path.startswith('/inventory'):
            self.path = '/inventory-demo.html'
        
        super().do_GET()

def start_server():
    PORT = 3000
    
    # Try different ports if 3000 is busy
    for port in range(3000, 3010):
        try:
            with socketserver.TCPServer(("", port), CustomHTTPRequestHandler) as httpd:
                print(f"🚀 Inventory Management System running at:")
                print(f"   Local:   http://localhost:{port}")
                print(f"   Network: http://127.0.0.1:{port}")
                print(f"\n📱 Features available:")
                print(f"   ✅ Inventory management with CRUD operations")
                print(f"   ✅ URL scanning and auto-fill")
                print(f"   ✅ Quantity controls (+/-)")
                print(f"   ✅ Custom fields and status tracking")
                print(f"   ✅ Real-time statistics")
                print(f"\n🔗 Try scanning these URLs:")
                print(f"   https://www.amazon.com/product/test")
                print(f"   https://www.walmart.com/product/test")
                print(f"\nPress Ctrl+C to stop the server")
                
                # Open browser after a short delay
                def open_browser():
                    time.sleep(1)
                    webbrowser.open(f'http://localhost:{port}')
                
                browser_thread = threading.Thread(target=open_browser)
                browser_thread.daemon = True
                browser_thread.start()
                
                httpd.serve_forever()
                break
        except OSError:
            continue
    else:
        print("❌ Could not start server - all ports busy")

if __name__ == "__main__":
    # Change to the project directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    print("🏭 Starting Inventory Management System...")
    print("=" * 50)
    
    start_server()
