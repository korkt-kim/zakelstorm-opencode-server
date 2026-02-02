#!/bin/sh
set -e

echo "OpenCode Entrypoint: Starting..."

# Install cache dependencies if package.json exists
if [ -f "/root/.cache/opencode/package.json" ]; then
    echo "Installing cache dependencies..."
    cd /root/.cache/opencode
    npm install --production
    echo "Cache dependencies installed successfully!"
else
    echo "No cache package.json found, skipping npm install"
fi

# Execute the original command
echo "Starting OpenCode server..."
exec "$@"
