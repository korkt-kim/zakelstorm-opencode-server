#!/bin/bash
set -e

# Required environment variables
if [ -z "$REPO_URL" ]; then
  echo "Error: REPO_URL environment variable is required"
  exit 1
fi

WORKDIR="/workspace"
REPO_NAME=$(basename "$REPO_URL" .git)
TARGET_DIR="$WORKDIR/$REPO_NAME"

# Clone the repository
mkdir -p "$WORKDIR"
cd "$WORKDIR"

if [ -d "$TARGET_DIR" ]; then
  echo "Repository already exists, pulling latest..."
  cd "$TARGET_DIR"
  git fetch --all
else
  echo "Cloning repository..."
  git clone "$REPO_URL" "$REPO_NAME"
  cd "$TARGET_DIR"
fi

# Checkout PR if specified
if [ -n "$PR_NUMBER" ]; then
  echo "Fetching PR #$PR_NUMBER..."
  git fetch origin pull/$PR_NUMBER/head:pr-$PR_NUMBER
  git checkout pr-$PR_NUMBER
  echo "Checked out PR #$PR_NUMBER"
fi

# Copy base opencode config if repo doesn't have one
if [ ! -d ".opencode" ]; then
  mkdir -p .opencode
fi

# Merge skills: copy base skills to repo's .opencode/skills
if [ -d "/app/.opencode/skills" ]; then
  mkdir -p .opencode/skills
  cp -rn /app/.opencode/skills/* .opencode/skills/ 2>/dev/null || true
  echo "Base skills copied to project"
fi

# Copy AGENTS.md if repo doesn't have one (preserve repo's AGENTS.md if exists)
if [ ! -f "AGENTS.md" ] && [ -f "/app/AGENTS.md" ]; then
  cp /app/AGENTS.md ./AGENTS.md
  echo "Base AGENTS.md copied to project"
fi

# Start opencode server and create session
SERVER_URL="http://localhost:3001"

opencode serve --port 3001 --hostname 0.0.0.0 &
SERVER_PID=$!

echo "Waiting for server to be ready..."
for i in $(seq 1 30); do
  if curl -s "$SERVER_URL/global/health" > /dev/null 2>&1; then
    echo "Server is ready!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "Error: Server failed to start"
    exit 1
  fi
  sleep 1
done

echo "Creating session..."
SESSION_RESPONSE=$(curl -s -X POST "$SERVER_URL/session" \
  -H "Content-Type: application/json" \
  -d "{}")

SESSION_ID=$(echo "$SESSION_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$SESSION_ID" ]; then
  echo ""
  echo "=== Ready for Code Review ==="
  echo "Session ID: $SESSION_ID"
  echo "API: $SERVER_URL"
  echo ""
else
  echo "Warning: Could not create session"
  echo "Response: $SESSION_RESPONSE"
fi

wait $SERVER_PID
