#!/usr/bin/env bash
# Start OpenClaw gateway for Omni (official image).
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required. Install Docker Engine/Desktop, then re-run."
  echo "Or install the CLI globally: npm i -g openclaw@latest && openclaw onboard --install-daemon"
  exit 1
fi

if [[ ! -f .env ]]; then
  cp .env.example .env
  # Generate a gateway token if still placeholder
  if grep -q 'replace-with-long-random-token' .env; then
    token="$(openssl rand -hex 24 2>/dev/null || head -c 48 /dev/urandom | xxd -p -c 48)"
    # portable sed
    if sed --version >/dev/null 2>&1; then
      sed -i "s/replace-with-long-random-token/${token}/" .env
    else
      sed -i '' "s/replace-with-long-random-token/${token}/" .env
    fi
    echo "Wrote OPENCLAW_GATEWAY_TOKEN to openclaw/.env"
  fi
  echo "Created openclaw/.env — add XAI_API_KEY (or another provider key), then re-run."
  exit 0
fi

mkdir -p data workspace

# Seed config once if missing
if [[ ! -f data/openclaw.json ]]; then
  token="$(grep '^OPENCLAW_GATEWAY_TOKEN=' .env | cut -d= -f2-)"
  mkdir -p data
  cat > data/openclaw.json <<EOF
{
  "gateway": {
    "mode": "local",
    "bind": "lan",
    "controlUi": { "enabled": true },
    "auth": { "mode": "token", "token": "${token}" }
  },
  "agents": {
    "defaults": {
      "model": { "primary": "xai/grok-4.5" }
    }
  }
}
EOF
  echo "Seeded data/openclaw.json (edit model/provider as needed)."
fi

echo "Pulling and starting OpenClaw…"
docker compose pull
docker compose up -d openclaw-gateway

echo
echo "Gateway:  http://127.0.0.1:${OPENCLAW_GATEWAY_PORT:-18789}/"
echo "Token:    (see OPENCLAW_GATEWAY_TOKEN in openclaw/.env)"
echo
echo "On iPad:"
echo "  1) Prefer Tailscale Serve / LAN URL → open Control UI in Safari"
echo "  2) Or add Telegram: docker compose --profile cli run --rm openclaw-cli channels add --channel telegram --token <bot-token>"
echo "  3) Omni TestFlight SYS → Runtime = OpenClaw → paste Control UI URL + token"
echo
docker compose ps
