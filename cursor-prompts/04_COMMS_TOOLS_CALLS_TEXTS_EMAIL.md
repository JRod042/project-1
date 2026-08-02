# Prompt 04 — Calls, texts, email as real agent tools

---

@00_CONTEXT_AND_RULES.md

Extend Omni so **calls, texts, and email** are first-class agent capabilities — architecture-first, with safe simulation mode when no provider keys exist.

## Design

### Modes

| Mode | When | Behavior |
|------|------|----------|
| `simulate` | default / no Twilio/SMTP | Create structured call/SMS/email records; stream tool results; optional webhooks stub |
| `twilio` | `TWILIO_*` env set | Real SMS / voice via Twilio REST |
| `smtp` / `resend` | mail env set | Real outbound email |

Always implement **simulate** fully so demos and CI work.

### Server tools (add to tool registry)

- `place_call` — to (phone or contact name), optional say/notes
- `end_call` — active call id
- `send_sms` — to, body
- `list_sms` / `list_calls` — recent
- `send_email` — to[], subject, body
- `list_email` / `read_email` — if storing inbox stubs
- `search_contacts` / `list_contacts` — from `contacts.json` or DB

### Persistence

- Store under `.omni/comms/` or SQLite: calls, messages, emails, contacts
- Session-safe; survive restarts

### Approval policy

- Outbound call / SMS / email **always** require approval unless `OMNI_AUTO_APPROVE_COMMS=1` (dev only, documented as dangerous)
- Simulated mode still goes through same approval UX so mobile path is tested

### Mobile (minimal)

- Optional “Comms” status lines when tool events arrive
- Do not build a full Gmail client UI in this prompt unless time allows; agent + records first

### Docs

- `server/.env.example` for Twilio/SMTP/Resend
- Short `docs/COMMS.md`: enable real providers later

## Verification

- Unit-level tests or a small node script that runs tool handlers in simulate mode
- Agent prompt/system text lists the new tools
- Multi-tool: “text X and email Y” works with dual approval or dual simulate after approve

