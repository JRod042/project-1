# Prompt 07 — Optional: Web Omni parity (only if you want browser + phone)

---

@00_CONTEXT_AND_RULES.md

If a web Omni app exists in the workspace (TanStack/Vite) or you create `web/`:

1. Keep **mobile + server** as source of truth for production agent protocol.
2. Web should call the **same** server SSE `/chat` API (not a second agent implementation), OR clearly label itself “demo local tools only”.
3. Do not let web work block Expo shipping.
4. Match branding: dark ops UI, lime accent, terminal timeline.

Skip this prompt entirely if the goal is only TestFlight.

