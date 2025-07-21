from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'newtechs-backend', 'src'))

from main import create_app

app = create_app()
CORS(app)

# Vercel serverless function handler
def handler(request):
    return app(request.environ, lambda status, headers: None)

if __name__ == "__main__":
    app.run()