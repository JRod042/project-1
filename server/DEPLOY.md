# Deploy Omni agent server

The iOS app talks to this server over HTTP + SSE. For TestFlight on a real device you need a reachable URL (LAN or tunnel).

## Local (LAN)

```bash
cd server
cp .env.example .env   # XAI_API_KEY + optional OMNI_SERVER_TOKEN
npm install
npm start              # http://0.0.0.0:8787
```

On the iPad: **SYS → Agent server URL** = `http://YOUR_LAN_IP:8787`.  
If you set `OMNI_SERVER_TOKEN`, paste the same value into **Server token**.

## Docker

```bash
cd server
docker build -t omni-server .
docker run --rm -p 8787:8787 \
  -e XAI_API_KEY \
  -e OMNI_SERVER_TOKEN \
  -e OMNI_SHELL_MODE=strict \
  -v "$PWD/workspace:/data/workspace" \
  omni-server
```

## Tunnel (no public VPS)

Use a tunnel so TestFlight can reach your laptop without opening the firewall.

### Cloudflare Quick Tunnel

```bash
# install cloudflared, then:
cloudflared tunnel --url http://127.0.0.1:8787
```

Copy the `https://….trycloudflare.com` URL into the app. Prefer setting `OMNI_SERVER_TOKEN` — the URL is public.

### ngrok

```bash
ngrok http 8787
```

Use the `https://….ngrok-free.app` URL in SYS.

## Security checklist

1. Set `OMNI_SERVER_TOKEN` before exposing any tunnel.
2. Keep `OMNI_SHELL_MODE=strict` unless you trust the client.
3. Never commit `.env`.
4. Workspace writes stay under `WORKSPACE_ROOT` (default `./workspace` or `/data/workspace` in Docker).

## Health

`GET /health` is public and reports `authRequired`, `shellMode`, and which provider keys are present (booleans only).
