#!/usr/bin/env bash
# Отключает парольный SSH, root только по ключу.
# Безопасно: сначала проверяет, что есть authorized_keys.
set -euo pipefail

if [[ ! -s /root/.ssh/authorized_keys ]]; then
  echo "ABORT: /root/.ssh/authorized_keys пуст — иначе потеряем доступ"
  exit 1
fi

CONF=/etc/ssh/sshd_config.d/99-impuls-hardening.conf
cat > "$CONF" <<'EOF'
# Impuls: только ключи
PasswordAuthentication no
KbdInteractiveAuthentication no
ChallengeResponseAuthentication no
PermitRootLogin prohibit-password
PubkeyAuthentication yes
EOF

# cloud-init иначе перебивает PasswordAuthentication
if [[ -f /etc/ssh/sshd_config.d/50-cloud-init.conf ]]; then
  sed -i 's/^PasswordAuthentication.*/PasswordAuthentication no/' \
    /etc/ssh/sshd_config.d/50-cloud-init.conf
fi

sshd -t
systemctl reload ssh || systemctl reload sshd

echo "SSH hardened. Effective:"
sshd -T | grep -E '^(passwordauthentication|permitrootlogin|pubkeyauthentication|kbdinteractiveauthentication) '
