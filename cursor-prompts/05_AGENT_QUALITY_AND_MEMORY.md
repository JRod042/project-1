# Prompt 05 — Agent quality, memory, missions

---

@00_CONTEXT_AND_RULES.md

Improve the **agent brain** without breaking tools.

## Goals

1. **System prompt** — Omni as concise operator; prefer tools for actions; resolve contacts by first name; multi-step planning.
2. **Memory** — `remember` / `recall` tools with disk persistence (key/value + optional tags).
3. **Missions** — `mission_plan` + step complete tools; missions listed in a simple API `GET /missions`.
4. **Briefing** — `briefing` tool aggregates unread mail stubs, recent SMS, open missions, active call.
5. **Model routing** — Keep xAI grok-4.5 default; document fallbacks; cap `max_tokens` and tool rounds (e.g. 12) to control cost.
6. **Idempotency** — Don’t double-send SMS if client retries the same approval id.

## Verification

- Scripted conversation fixtures (JSON) that mock LLM tool_calls and assert tool executor results
- No infinite tool loops

