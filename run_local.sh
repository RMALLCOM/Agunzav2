#!/usr/bin/env bash
set -euo pipefail

# JetSMART Kiosk - Local runner (Linux/macOS)
# - Starts FastAPI backend on :8001 (ALWAYS_COMPLY=1)
# - Starts React dev server on :3000 with REACT_APP_BACKEND_URL=http://localhost:8001
# - Kills backend when you stop the frontend (Ctrl+C)

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
VENV_DIR="$BACKEND_DIR/.venv"

banner() {
  echo "=================================================="
  echo "$1"
  echo "=================================================="
}

banner "1) Preparing Python virtualenv (backend)"
if [ ! -d "$VENV_DIR" ]; then
  python3 -m venv "$VENV_DIR"
fi
# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"
pip install --upgrade pip >/dev/null
pip install -r "$BACKEND_DIR/requirements.txt"

banner "2) Launching FastAPI backend on :8001 (ALWAYS_COMPLY=1)"
export ALWAYS_COMPLY=1
pushd "$BACKEND_DIR" >/dev/null
# Start backend in background
uvicorn server:app --host 0.0.0.0 --port 8001 >/dev/null 2>&1 &
BACKEND_PID=$!
popd >/dev/null
sleep 1

echo "Backend PID: $BACKEND_PID"

cleanup() {
  echo "\nStopping backend (PID $BACKEND_PID) ..."
  if ps -p "$BACKEND_PID" >/dev/null 2>&1; then
    kill "$BACKEND_PID" || true
  fi
}
trap cleanup EXIT INT TERM

banner "3) Starting React dev server on :3000"
export REACT_APP_BACKEND_URL="http://localhost:8001"
cd "$FRONTEND_DIR"
# Install deps if needed
if [ ! -d node_modules ]; then
  yarn install
fi

# Ensure local background image (optional, replace with your own file)
# Expected path: frontend/public/assets/jetsmart_bg.jpg
mkdir -p public/assets
if [ ! -f public/assets/jetsmart_bg.jpg ]; then
  echo "Tip: place your background at frontend/public/assets/jetsmart_bg.jpg"
fi

yarn start
