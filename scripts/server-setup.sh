#!/usr/bin/env bash
# Run once on fresh Ubuntu VPS (as root)
set -euo pipefail

apt-get update -y
apt-get install -y ca-certificates curl git ufw

# Docker
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi

systemctl enable --now docker
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

mkdir -p /opt/cocos-partner
echo "OK: Docker ready. Put project into /opt/cocos-partner"
