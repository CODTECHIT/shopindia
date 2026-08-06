#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${REPO_URL:-}"
APP_DIR="/opt/shopindia"
SERVER_DIR="$APP_DIR/shop-india-/server"

if [ -z "$REPO_URL" ]; then
  echo "Usage: REPO_URL=https://github.com/<you>/<repo>.git ./deploy.sh"
  exit 1
fi

echo "==> Installing Node 20, npm, pm2"
sudo dnf install -y nodejs20 npm git || sudo apt-get install -y nodejs npm git
sudo npm i -g pm2 n
sudo n 20 || true

echo "==> Fetching code"
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR" && sudo git pull
else
  sudo git clone "$REPO_URL" "$APP_DIR"
  sudo chown -R "$USER":"$USER" "$APP_DIR"
fi

echo "==> Installing backend deps + applying schema"
cd "$SERVER_DIR"
npm ci
npx prisma migrate deploy
npx prisma generate

echo "==> Starting API"
pm2 restart shopindia-api 2>/dev/null || pm2 start index.js --name shopindia-api
pm2 save
sudo env PATH="$PATH:/usr/local/bin" pm2 startup systemd -u "$USER" --hp "/home/$USER"

echo "==> Done. Health check:"
curl -s "http://localhost:5001/api/health"
echo