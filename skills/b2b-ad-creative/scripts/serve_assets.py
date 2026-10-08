# Local file server for the figma-console Desktop Bridge: serves a campaign's ads folder,
# plus this skill's scripts under /skill/, with the CORS header Figma's plugin fetch needs.
# POST /upload/<file name> saves the body to <folder>/exports/ (used by export.js to save PNGs).
# The bridge only allows localhost ports 9223-9232; use a free one from 9228-9232.
#   python3 serve_assets.py 9231 "<project folder>/ads/<date>-<slug>"
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

SKILL_SCRIPTS = Path(__file__).resolve().parent


class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        if path.startswith("/skill/"):
            return str(SKILL_SCRIPTS / Path(path[len("/skill/"):].split("?")[0]).name)
        return super().translate_path(path)

    def do_POST(self):
        if not self.path.startswith("/upload/"):
            self.send_error(404)
            return
        name = Path(self.path[len("/upload/"):].split("?")[0]).name   # file name only, never a path
        if not name.endswith(".png"):
            self.send_error(400, "PNG files only")
            return
        target = Path(self.directory) / "exports" / name
        target.parent.mkdir(exist_ok=True)
        target.write_bytes(self.rfile.read(int(self.headers["Content-Length"])))
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"saved")

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Methods", "GET, POST")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


port, folder = int(sys.argv[1]), sys.argv[2]
ThreadingHTTPServer(("127.0.0.1", port), partial(Handler, directory=folder)).serve_forever()
