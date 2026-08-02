# Omni — North star (pin this)

**Omni is like Grok or Antigravity in the terminal — but for iPhone.**

## One sentence
A pocket **operator terminal**: you issue intent, the agent plans, runs tools on your server, streams a live log, and asks approval when it would change the world.

## Feel
- Open app → dark terminal, not a marketing home screen
- Type like a command line / agent chat hybrid
- See `tool::shell`, `tool::send_sms`, results inline
- SYS connects to *your* agent runtime (LAN or VPS)
- Personality: capable, concise, slightly dry — Grok-adjacent operator, not corporate assistant

## Architecture
```
iPhone Omni (Expo terminal UI)
    │  SSE /chat + approvals
    ▼
server/ agent loop (Grok/tools)
    │
    ▼
workspace + web + comms providers
```

## When choosing UX
Prefer: fewer screens, deeper timeline, better tools, clearer SYS.
Avoid: dashboard tiles, “AI companion” fluff, hiding tool activity.

## Shipping
TestFlight (`com.jrod042.omni`) is the real product path. Web is optional shadow.
