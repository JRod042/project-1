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

## Quick start (Linux VPS or any Docker host)

```bash
cd openclaw
cp .env.example .env
# edit: XAI_API_KEY=…  (and keep the generated OPENCLAW_GATEWAY_TOKEN)
chmod +x up.sh
./up.sh
```

Open the Control UI:

- Local: `http://127.0.0.1:18789/`
- Phone on same LAN: `http://<host-lan-ip>:18789/`
- Remote: Tailscale Serve (recommended) — see [docs](https://docs.openclaw.ai/web)

Paste `OPENCLAW_GATEWAY_TOKEN` into Control UI Settings.

### No Docker?

```bash
npm i -g openclaw@latest
openclaw onboard --install-daemon
openclaw dashboard
```

## Fastest phone chat (no Expo rebuild)

1. Create a Telegram bot with [@BotFather](https://t.me/BotFather)
2. On the host:

```bash
docker compose --profile cli run --rm openclaw-cli \
  channels add --channel telegram --token "<bot-token>"
```

3. Message the bot from your iPad. Pairing codes: [Telegram channel docs](https://docs.openclaw.ai/channels/telegram)

## Omni TestFlight app

In **SYS**:

1. Runtime → **OpenClaw**
2. Control UI URL → your gateway URL (port **18789**)
3. Gateway token → same as `OPENCLAW_GATEWAY_TOKEN`
4. **OPEN CONTROL UI** launches Safari with the dashboard

Native SSE chat against OpenClaw’s WebSocket protocol is not mirrored 1:1 yet; Control UI + Telegram are the supported operator paths. Legacy Omni SSE remains available under Runtime → **Legacy Omni**.

## Security

- Never expose `:18789` to the public internet without auth + TLS / Tailscale.
- Keep `OPENCLAW_GATEWAY_TOKEN` long and private.
- Read [exposure runbook](https://docs.openclaw.ai/gateway/security/exposure-runbook).

## License

OpenClaw is MIT (OpenClaw Foundation). This wrapper is part of Omni (MIT).
