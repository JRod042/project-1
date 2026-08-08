# AGENTS.md

## Cursor Cloud specific instructions

Omni is one product (a "Jarvis-class" phone operator) made of an **iOS Expo app** (`mobile/`)
plus an **agent runtime**. Two runtimes ship in the repo: **OpenClaw** (Docker, primary — see
`openclaw/README.md`) and the **legacy Omni SSE server** (`server/`). Standard commands live in the
root `package.json` scripts and `README.md`; only the non-obvious cloud caveats are captured here.

### Mobile app (`mobile/`)
- The iOS app **cannot run in this Linux VM** (no macOS / Xcode / iOS simulator, and there is no
  React Native web target). Do not try to launch a simulator or `expo start --web`.
- Verify the app compiles two ways: `npm --prefix mobile run typecheck`, and by bundling through
  Metro — `npx expo start` (Metro serves on `:8081`), then request
  `http://127.0.0.1:8081/index.bundle?platform=ios&dev=true` to force a full transform. A clean run
  logs `iOS Bundled … index.ts (NNN modules)`.
- Building/shipping the actual `.ipa` happens via EAS/GitHub Actions (`.github/workflows/ios-testflight.yml`),
  which needs Apple/Expo secrets — out of scope for local dev.

### Legacy server (`server/`)
- Run with `npm --prefix server dev` (watch) or `npm --prefix server start`; listens on
  `http://0.0.0.0:8787`. Tests: `npm --prefix server test`. Typecheck: `npm --prefix server run typecheck`.
- It runs **open (no auth)** unless `OMNI_SERVER_TOKEN` is set. `/health` is always public; all other
  routes require the token only when it is set.
- `/health`, `/tools`, `/sessions` work with no configuration. **`POST /chat` needs a real LLM
  provider key** (`XAI_API_KEY` / `OPENAI_API_KEY` / `GEMINI_API_KEY` in `server/.env`, or an
  `x-api-key` request header). Without one, `/chat` still streams `session`/`status` events and then a
  clear `error: Missing API key` — the agent loop, tool registry, approval queue and session store all
  work regardless. Sessions persist under `server/workspace/` (gitignored).

### OpenClaw runtime (`openclaw/`)
- Primary runtime, but requires **Docker** (not installed in the base VM) and a gateway token; it pulls
  the upstream `openclaw/openclaw` image and needs an xAI key/OAuth for real responses. Optional for
  local dev — the legacy `server/` is the lightweight path to exercise the agent end to end.
