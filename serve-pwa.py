"""Local HTTPS-less PWA server (localhost is enough for Service Worker)."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parent
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8787

AVATAR_ALIAS = "/local-cdn/cms-res-web/1c/80/c2/a8/260bfc7752a82cc7e3ae3821_12301.png"

ROUTE_MAP = {
    "/": "/index.html",
    "/app": "/Main.htm",
    "/app/": "/Main.htm",
    "/app/main": "/Main.htm",
    "/app/main/": "/Main.htm",
    "/app/savings": "/Savings.htm",
    "/app/savings/": "/Savings.htm",
    # legacy names (pre-rename)
    "/Sber Main.htm": "/Main.htm",
    "/Sber Savings.htm": "/Savings.htm",
}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def translate_path(self, path):
        clean = path.split("?", 1)[0].split("#", 1)[0]
        clean = unquote(clean)
        mapped = ROUTE_MAP.get(clean)
        if clean.startswith("/1c/") and (ROOT / AVATAR_ALIAS.lstrip("/")).is_file():
            path = AVATAR_ALIAS
        elif mapped:
            path = mapped
        else:
            # legacy folder prefixes after rename Sber * → *
            for old_prefix, new_prefix in (
                ("/Sber Main_files/", "/Main_files/"),
                ("/Sber Savings_files/", "/Savings_files/"),
                ("/Sber%20Main_files/", "/Main_files/"),
                ("/Sber%20Savings_files/", "/Savings_files/"),
            ):
                if clean.startswith(old_prefix):
                    path = new_prefix + clean[len(old_prefix) :]
                    break
            else:
                for prefix in ("/app/main/", "/app/savings/", "/app/"):
                    if clean.startswith(prefix):
                        candidate = "/" + clean[len(prefix) :]
                        full = ROOT / candidate.lstrip("/").replace("/", "\\")
                        if full.is_file():
                            path = candidate
                        break
        return super().translate_path(path)

    def guess_type(self, path):
        p = str(path).lower()
        if p.endswith(".webmanifest"):
            return "application/manifest+json"
        if p.endswith(".woff2"):
            return "font/woff2"
        if p.endswith(".woff"):
            return "font/woff"
        return super().guess_type(path)

    def end_headers(self):
        path_only = self.path.split("?", 1)[0]
        if path_only.endswith("sw.js"):
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Service-Worker-Allowed", "/")
        elif path_only.endswith(".htm") or path_only.endswith(".html") or path_only in (
            "/",
            "/app/main",
            "/app/savings",
            "/app",
            "/app/",
            "/app/main/",
            "/app/savings/",
        ):
            self.send_header("Cache-Control", "no-cache")
        if path_only.endswith(".webmanifest"):
            self.send_header("Content-Type", "application/manifest+json")
        if path_only.endswith(".woff2") or path_only.endswith(".woff"):
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Cache-Control", "public, max-age=31536000")
        super().end_headers()


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"PWA: http://127.0.0.1:{PORT}/  (LAN: 0.0.0.0:{PORT})", flush=True)
    print("Routes: /app/main  /app/savings", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped", flush=True)
