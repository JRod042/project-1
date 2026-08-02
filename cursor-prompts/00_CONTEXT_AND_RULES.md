# Omni — Shared Context for Cursor (read first, every session)

You are working on **Omni**.

## North star (never dilute this)

**Omni is Grok / Antigravity / Cursor-agent — but as a pocket terminal on iPhone.**

Not a lifestyle dashboard. Not a notes app with AI. Not “ChatGPT skin.”

It is:

| Omni is | Omni is NOT |
|---------|-------------|
| A **terminal-first operator surface** on iPhone (and iPad) | A social feed, habit tracker, or generic chatbot UI |
| An **agent that runs tools** (shell, files, web, comms) | Answer-only LLM chat with no side effects |
| **SSE streaming timeline** of thought → tool → result | A single bubble reply with hidden work |
| **Approvals** for dangerous / outbound actions | Silent world-changing tools |
| Paired with a **real agent server** you run | Fully on-device magic with no runtime |
| Ship via **TestFlight** (`com.jrod042.omni`) | Web-only demo as the product |

Mental model users should feel:

> “I opened a Grok-class agent in my pocket. I type like I’m in a terminal. It plans, calls tools, asks when it should, and shows the log.”

Like:

- **Grok** — capable, direct, tool-using assistant personality/power  
- **Antigravity / Cursor Agent / Claude Code / terminal agents** — iterative tool loop, visible work, workspace-backed  
- **On iPhone** — one-handed, keyboard-aware, SYS to your server, TestFlight install  

## Two surfaces (do not confuse them)

| Surface | Path | Role |
|---------|------|------|
| **iPhone control surface** | `mobile/` Expo | Terminal UI, approvals, SYS — the product people hold |
| **Agent server** | `server/` | LLM + tools + workspace — the brain/hands |
| **Web demo (optional)** | `web/` only if present | Convenience mirror; **never** replaces mobile |

Repo: `https://github.com/JRod042/project-1`  
Expo: `@jrod42/omni` · bundle **`com.jrod042.omni`** · min iOS **16.4**  
EAS GitHub base directory: **`mobile`** · profile **`production`** → TestFlight  

## Product goals

1. User types (or later speaks) natural language **in a terminal timeline**.
2. Agent plans multi-step work → **tools execute** (shell, fs, web, memory, missions, calls/SMS/email).
3. Dangerous / outbound actions go through **approval chips** on the phone.
4. Session survives; server can be LAN or public URL in **SYS**.
5. Expo.dev iOS builds stay **boring and reliable**.

## UX principles (terminal agent on phone)

1. **Timeline > chat bubbles** — monospace-friendly log: `you ›`, `omni ›`, `tool::name`, status `// …`
2. **Show the work** — tool args + truncated output always visible
3. **Dense but readable** — dark ops theme; lime/brand accent sparingly
4. **SYS is sacred** — server URL, token, provider/model, TEST LINK — first-run must teach this
5. **One primary composer** — Enter to send; approvals dock above composer
6. **No fake “connected to 47 apps” chrome** — real tools only
7. **Latency honesty** — streaming status beats spinners that lie

## Non-negotiable engineering rules

1. **Never break Expo iOS production.** Verify `app.config.js`, `eas.json`, plugins, `ios.buildNumber` (string; bump per store binary; no broken autoIncrement with app.config.js).
2. **Do not reverse Omni** via old revert-PR direction.
3. Keep `EXPO_USE_PRECOMPILED_MODULES=0` and `privacyManifestAggregationEnabled: false` unless you prove a better fix.
4. ATS: `NSAllowsLocalNetworking` for LAN agent — **not** global arbitrary loads.
5. Multi-tool batches: **queue** remaining tools when pausing for approval (`pendingToolQueue`). No orphaned tool_calls.
6. Path/shell tools stay inside workspace / sandbox; timeouts + output caps.
7. Optional `OMNI_SERVER_TOKEN` — mobile sends Bearer from SecureStore.
8. Never commit secrets.
9. Prefer small, reviewable changes; one prompt = one concern when sequential.
10. After mobile native-config changes: document TestFlight rebuild.

## Stack facts

- Mobile: Expo RN, SecureStore, SSE client → `/chat`
- Server: TypeScript agent loop, xAI / OpenAI / Gemini, tools in `tools.ts`
- Default model preference: **grok-4.5** when xAI available

## Definition of done (session)

- [ ] Change serves the **pocket terminal agent** north star
- [ ] iOS EAS path not regressed
- [ ] Tool loop / approval path not regressed
- [ ] SYS / first-run still teach “server + terminal”
- [ ] Summary includes next Expo/TestFlight step if needed

