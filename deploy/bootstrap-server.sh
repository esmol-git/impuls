#!/usr/bin/env bash
# Одноразовая подготовка VPS под Impuls (Ubuntu 24.04).
# Запуск: ssh impuls 'bash -s' < deploy/bootstrap-server.sh
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

echo "==> 1. Система и пакеты"
apt-get update -y
apt-get upgrade -y
apt-get install -y \
  ca-certificates curl gnupg ufw fail2ban \
  qemu-guest-agent \
  git rsync unzip

systemctl enable --now qemu-guest-agent || true

echo "==> 2. Firewall (SSH + HTTP/HTTPS)"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "==> 3. Docker"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker
usermod -aG docker root || true

echo "==> 4. Node.js 22"
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
node -v
# lockfile проекта собирается npm 11+ (optional native bindings)
npm install -g npm@11 >/dev/null
npm -v

echo "==> 5. Caddy"
if ! command -v caddy >/dev/null 2>&1; then
  apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    | tee /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -y
  apt-get install -y caddy
fi
systemctl enable caddy

echo "==> 6. Каталоги"
mkdir -p /opt/impuls /var/www/admin.impuls.esmolakov.ru /opt/impuls-data
chown -R www-data:www-data /var/www/admin.impuls.esmolakov.ru

echo "==> Готово (база). Дальше: Postgres/MinIO, env, systemd, деплой."
docker --version
caddy version
node -v
