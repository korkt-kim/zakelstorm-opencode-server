#!/bin/sh
set -e

echo "OpenCode Entrypoint: Starting..."

if [ -f "/root/.cache/opencode/package.json" ]; then
    echo "Cache package.json found"
    
    if command -v npm >/dev/null 2>&1; then
        echo "Installing cache dependencies with npm..."
        cd /root/.cache/opencode
        npm install --production
        echo "Cache dependencies installed successfully!"
    else
        echo "WARNING: npm not found, skipping dependency installation"
        echo "Dependencies must be installed on the host machine"
    fi
else
    echo "No cache package.json found, skipping dependency installation"
fi

echo "Starting OpenCode server..."
exec "$@"
