# OpenClaw — Omni’s primary agent runtime

**Verdict:** for a Jarvis-class personal operator on your phone, **[OpenClaw](https://github.com/openclaw/openclaw)** is the better repository than the bespoke `server/` in this monorepo.

| Candidate | Why not primary |
|-----------|-----------------|
| Custom Omni `server/` | Works, but reinventing gateway/tools/channels/memory |
| [handrail](https://github.com/zfifteen/handrail) / [grok-build-ios](https://github.com/Pedroshakoor/grok-build-ios) | Need a **Mac** + Xcode; you ship via EAS/TestFlight with **no Mac** |
| [grok-remote](https://github.com/daniel-farina/grok-remote) | Solid ACP/PWA idea; still Mac-hosted Grok CLI |
| **OpenClaw** | Self-hosted gateway, tools, memory, 25+ channels, Control UI, Linux/VPS, Grok/xAI supported |

This folder **implements OpenClaw as Omni’s brain** via the official Docker image. We do **not** vendor the 300k+ LOC monorepo.

## Architecture (target)

```
iPad Omni (TestFlight)  ──open Control UI──┐
Safari / Telegram / Discord                 │
                                            ▼
                                 OpenClaw Gateway :18789
                                            │
                                   tools · workspace · skills
```

Legacy path (still in repo): Expo terminal ↔ Omni `server/` SSE on `:8787`.

## Install path A — Docker wrapper (this folder)

```bash
cd openclaw
cp .env.example .env
# optional: XAI_API_KEY=…  (not required if you already used xAI OAuth via onboard)
# keep / generate OPENCLAW_GATEWAY_TOKEN
chmod +x up.sh
./up.sh
```

Uses image `openclaw/openclaw:latest` (see `docker-compose.yml`).

## Install path B — npm global (host daemon)

If OpenClaw is already on the machine (common after first setup):

```bash
npm i -g openclaw@latest
openclaw onboard --install-daemon   # once
openclaw gateway status             # expect :18789
openclaw dashboard
```

State lives under `~/.openclaw/` (config: `~/.openclaw/openclaw.json`).

### Auth / models

- **Gateway token:** `gateway.auth.token` in `~/.openclaw/openclaw.json`, or `OPENCLAW_GATEWAY_TOKEN` in `openclaw/.env` for Docker.
- **xAI:** OAuth via `openclaw onboard` works **without** `XAI_API_KEY`. API keys are optional if OAuth is already linked (e.g. default `xai/grok-4.3`).

## Control UI URLs

- Local host: `http://127.0.0.1:18789/`
- Phone on same LAN: `http://<host-lan-ip>:18789/`
- Remote: Tailscale Serve (recommended) — see [docs](https://docs.openclaw.ai/web)

**Token via URL fragment** (what Omni TestFlight uses):

```
http://<LAN-IP>:18789/#token=<OPENCLAW_GATEWAY_TOKEN>
```

You can also paste the token into Control UI Settings manually.

## Fastest phone chat (no Expo rebuild)

1. Create a Telegram bot with [@BotFather](https://t.me/BotFather)
2. On the host (Docker path):

```bash
docker compose --profile cli run --rm openclaw-cli \
  channels add --channel telegram --token "<bot-token>"
```

Or with npm global: `openclaw channels add --channel telegram --token "<bot-token>"`

3. Message the bot from your iPad. Pairing codes: [Telegram channel docs](https://docs.openclaw.ai/channels/telegram)

## Omni TestFlight app

In **SYS**:

1. Runtime → **OpenClaw**
2. Control UI URL → `http://<LAN-IP>:18789` (not localhost on iPad)
3. Gateway token → from `~/.openclaw/openclaw.json` (`gateway.auth.token`) or `openclaw/.env`
4. **OPEN CONTROL UI** launches an in-app browser as `…#token=…`
   (avoids iOS `Linking` escaping `#` → `%23`, which breaks OpenClaw auth)

Native SSE chat against OpenClaw’s WebSocket protocol is not mirrored 1:1 yet; Control UI + Telegram are the supported operator paths. Legacy Omni SSE remains available under Runtime → **Legacy Omni**.

## Security

- Never expose `:18789` to the public internet without auth + TLS / Tailscale.
- Keep the gateway token long and private; never commit `.env`.
- Read [exposure runbook](https://docs.openclaw.ai/gateway/security/exposure-runbook).

## License

OpenClaw is MIT (OpenClaw Foundation). This wrapper is part of Omni (MIT).
