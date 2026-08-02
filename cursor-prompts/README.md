# Cursor master prompts — Omni (sequential)

Use these **in order** in Cursor Agent mode on `https://github.com/JRod042/project-1`.

| Order | File | Purpose |
|------:|------|---------|
| ★ | `NORTH_STAR.md` | Product identity: terminal agent on iPhone |
| 0 | `00_CONTEXT_AND_RULES.md` | Pin this every session (rules of engagement) |
| 1 | `01_AUDIT_HARDENING.md` | Server security + multi-tool approval + sessions |
| 2 | `02_EXPO_IOS_BUILD_LOCKDOWN.md` | Stop Expo/TestFlight breakage |
| 3 | `03_MOBILE_SYS_AND_SSE.md` | iPhone SYS + SSE reliability |
| 4 | `04_COMMS_TOOLS_CALLS_TEXTS_EMAIL.md` | Calls / SMS / email tools |
| 5 | `05_AGENT_QUALITY_AND_MEMORY.md` | Memory, missions, briefing |
| 6 | `06_TESTFLIGHT_SHIP_CHECKLIST.md` | Ship docs + buildNumber + human checklist |
| 7 | `07_OPTIONAL_WEB_OMNI_PARITY.md` | Browser UI only if needed |

## How to run in Cursor

1. Clone `JRod042/project-1` and open the folder in Cursor.
2. Copy `artifacts/cursor-prompts/` into the repo root as `cursor-prompts/` (or keep them in chat).
3. New Agent chat → paste **Prompt 01** (include reference to `00_CONTEXT…`).
4. When Cursor finishes and you accept the diff → commit → next prompt.
5. Do **not** skip **02** if you care about Expo.dev iOS builds.

## GitHub connector write access (for Grok PR push)

Still separate from Cursor:

1. GitHub → Settings → Applications → Installed GitHub Apps → **Grok** → Configure  
2. Select `project-1` + Contents/PR **write**  
3. Reconnect GitHub in Grok Connectors  

Cursor uses **your** git credentials — usually easier for PRs.

## Expo.dev iOS — human loop (never fully automatable)

Cursor can prepare the repo; **you** must:

1. Validate Distribution Certificate + App Store profile in Expo credentials UI  
2. Click **Build from GitHub** (base dir `mobile`, profile `production`)  
3. Submit → TestFlight → install on iPhone  
4. Run agent server and set SYS URL  

## One-shot mega prompt (if you only want a single paste)

If you prefer a single Cursor message, use `MEGA_PROMPT.md` in this folder — it sequences 01→06 internally and forbids skipping iOS preflight.

