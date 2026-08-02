# Omni

**Jarvis for your phone — but it actually does the work.**

Omni is a personal AI super-app: agent-first like [Grok Build](https://x.ai/cli) / [Google Antigravity](https://antigravity.google), available as a mobile command surface that can plan, research, code, run shell, manage files, and keep memory.

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│  Omni app   │  SSE  │  Omni agent      │ tools │  Workspace  │
│  (Expo)     │──────▶│  server          │──────▶│  + web      │
└─────────────┘       └──────────────────┘       └─────────────┘
```

## What you get

- **Terminal-style mission feed** on iOS/Android (Expo)
- **Tool-using agent** — files, shell, web search/fetch, memory, mission plans
- **Approval gates** for risky actions (shell / writes), or auto-approve
- **Bring your brain** — xAI Grok, OpenAI, or Gemini
- **Always-on personal agent framing** — command it like Jarvis, not a chatbot toy

## Quick start

### 1. Agent server

```bash
cd server
cp .env.example .env
# put XAI_API_KEY / OPENAI_API_KEY / GEMINI_API_KEY in .env
npm install
npm run dev
```

Server listens on `http://0.0.0.0:8787`.

### 2. Phone app

```bash
cd mobile
npm install
npm start
```

Scan the QR with **Expo Go**.

In the app, open **SYS** and set:

- **Agent server URL** → your computer's LAN IP, e.g. `http://192.168.1.20:8787`  
  (phones cannot reach `127.0.0.1` on your laptop)
- Provider + model (default `xai` / `grok-4`)
- API key if you didn't put it in `server/.env`

### 3. Talk to it

Try:

- “Research the best way to automate my inbox and write a plan”
- “Create a Node script that renames photos by date, then run a dry test”
- “Remember that I prefer brief status updates”

## Repo layout

| Path | Role |
|------|------|
| `mobile/` | Expo React Native command center |
| `server/` | Hono agent runtime + tools + SSE chat |

## Roadmap (Jarvis-class)

- Voice in / voice out
- Device skills (calendar, messages, reminders) via OS permissions + shortcuts
- Parallel missions / subagents
- Home/cloud computer bridge so Omni can act on your real machines
- Proactive briefings (“good morning” ops report)

## License

MIT (see `mobile/LICENSE` for Expo template license text).
