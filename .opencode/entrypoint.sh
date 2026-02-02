#!/bin/sh
set -e

echo "OpenCode Entrypoint: Starting..."

if [ -f "/root/.cache/opencode/package.json" ]; then
    echo "Cache package.json found, installing dependencies..."
    cd /root/.cache/opencode
    npm install --production --silent
    echo "Cache dependencies installed successfully!"
else
    echo "No cache package.json found, skipping dependency installation"
fi

echo "Starting OpenCode server..."
exec "$@"
