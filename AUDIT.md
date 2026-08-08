# Casa Rustico — security baseline

**Product:** cloud business app (iPhone/iPad + hosted backend).  
**Constraint:** no Linux host, no Mac, no self-hosted gateway.

Legacy Omni / OpenClaw hardening below is **historical** — that stack is out of the product path. See **[docs/REPO_DECISION.md](docs/REPO_DECISION.md)**.

## Casa Rustico (current)

| Control | Expectation |
|---------|-------------|
| No secrets in git | yes — `.env`, keys, `service_role` never committed |
| App keys | Only `EXPO_PUBLIC_SUPABASE_URL` + anon key in the client |
| Service role | Edge Functions / dashboard only — never shipped in the IPA |
| Auth | Supabase Auth; RLS on every business table |
| Roles | owner / manager / staff enforced in RLS + app gates |
| EAS / Apple secrets | GitHub + EAS secrets only |
| No home server | App must work with zero LAN/Docker/OpenClaw dependency |

## Historical — legacy Omni server (archived path)

The following applied to the old Jarvis operator (`server/` + OpenClaw). Do not extend; do not require for Casa Rustico.

| Control | Status (legacy) |
|---------|-----------------|
| `OMNI_SERVER_TOKEN` on protected routes | yes |
| Approval for shell / writes | yes |
| Path sandbox to `WORKSPACE_ROOT` | yes |
| Shell blocklist + scrubbed env | yes |
| `/chat` size + rate limit | yes |
| Sessions / audit on disk | yes |

Those guarantees assumed a machine Jorge no longer has. **Do not revive that runtime as a dependency.**
