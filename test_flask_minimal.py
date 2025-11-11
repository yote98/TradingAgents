"""Minimal Flask test to verify Flask works."""

from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'message': 'Flask is working!'})

@app.route('/')
def index():
    return jsonify({'message': 'Minimal test server is running'})

if __name__ == '__main__':
    print("Starting minimal Flask server on http://localhost:5000")
    print("Test with: curl http://localhost:5000/health")
    print("Press Ctrl+C to stop")
    app.run(host='0.0.0.0', port=5000, debug=False)
