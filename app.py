import os
import json
from flask import Flask, render_template, jsonify

app = Flask(__name__)

# Путь к файлу с метриками
METRICS_FILE = r"PATH"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/metrics')
def get_metrics():
    try:
        with open(METRICS_FILE, 'r', encoding='utf-8') as f:
            metrics = json.load(f)
        return jsonify(metrics)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)