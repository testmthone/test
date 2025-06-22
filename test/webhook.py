#!/usr/bin/env python3

from flask import Flask, request
import subprocess
import os

app = Flask(__name__)

@app.route('/deploy', methods=['POST'])
def deploy():
    try:
        # Change to project directory
        os.chdir('/var/www/portfolio')
        
        # Run deploy script
        result = subprocess.run(['./deploy.sh'], capture_output=True, text=True)
        
        if result.returncode == 0:
            return f"✅ Deploy successful!\n{result.stdout}", 200
        else:
            return f"❌ Deploy failed!\n{result.stderr}", 500
            
    except Exception as e:
        return f"❌ Error: {str(e)}", 500

@app.route('/health')
def health():
    return "OK", 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9000) 