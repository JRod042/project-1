# Casa Rustico — system replan (cloud-only)

All-around business app for Casa Rustico.  
**Revised:** no Linux computer, no Mac, no home server, no OpenClaw.

> Assumption: hospitality house (restaurant / events / catering). Adjust modules in §8 if the mix differs.

---

## 0. Constraint that rewrites the system

| Gone | Implication |
|------|-------------|
| Linux PC / always-on host | Cannot run Docker, Omni server, OpenClaw, local Postgres |
| Mac | Cannot local Xcode; **EAS only** |
| LAN / Tailscale to a house machine | App must use **public HTTPS cloud** only |

**Allowed infrastructure**

1. Jorge’s iPhone / iPad (TestFlight)  
2. Expo Application Services (build + submit)  
3. Hosted backend (Supabase cloud default)  
4. Optional: cloud LLM via Edge Functions  
5. Optional later: Twilio / Stripe cloud APIs  

**Setup Jorge should never need again:** install Docker, copy `.env` on a PC, set `http://192.168.x.x:18789`, leave a computer powered for the app to work.

---

## 1. Why this product

| Omni (dead path) | Casa Rustico (live path) |
|------------------|--------------------------|
| Agent on a server you own | Business HQ in the cloud |
| Gateway URL + token in SYS | Sign-in → house data |
| Breaks without Linux host | Works anywhere with internet |
| Cyber terminal | Warm hospitality ops UI |

---

## 2. Personas & jobs

| Persona | Primary jobs |
|---------|----------------|
| **Owner** | Today pulse, books health, coverage, daily close, promos |
| **Manager** | Reserve, seat, waitlist, comps, floor notes |
| **Kitchen** | Ticket rail, 86, prep, low stock |
| **Floor** | Tables, courses, guest notes |
| **Catering** | Leads → deposit → event day |
| **Guest** (later) | Public booking page (hosted web), not a home server |

---

## 3. Information architecture

Tabs (iPad-first):

1. **Today** — brand hero + today’s headline + one CTA + one real image  
2. **Book** — reservations / waitlist / parties  
3. **Floor** — tickets, 86, (P1) table map  
4. **House** — menu, inventory, staff, vendors, events  
5. **More** — guests, reports, settings, (P2) house assistant  

**Removed forever from IA:** SYS gateway console, uplink-to-LAN bar, Open Control UI, legacy SSE mode switch.

---

## 4. Module map

### P0 — MVP (ship without any PC)
| Module | Must have |
|--------|-----------|
| **Cloud auth & roles** | Owner / manager / staff via Supabase Auth (email magic link or password); optional floor PIN later |
| **Today board** | Covers, next arrivals, open tickets, who’s on — from cloud DB |
| **Reservations** | CRUD + seat / no-show / cancel |
| **Menu + 86** | Categories, items, price, allergens; 86 syncs realtime to all devices |
| **Tickets lite** | Open → items → send → fire → close |
| **Staff today** | Shift list for the date |
| **Daily close** | Covers, sales total (manual entry OK), notes |
| **House settings** | Name, hours, timezone, service periods — in cloud |

### P1 — Depth (still cloud-only)
Table map, waitlist, inventory, vendors, week schedule, guests CRM, events/catering.

### P2 — Growth
Reports, promos, Stripe/Square cloud hooks, **hosted** public booking (Vercel/Netlify/Supabase), house assistant via **Edge Function + LLM API**.

Out of scope v1: certified POS, payroll engine, anything needing an on-prem bridge.

---

## 5. Brand & design

Warm rustic Italian house. Expressive display font (Fraunces / Literata), clean UI sans, olive-ink / linen / brass — not acid lime cyber HUD.  
Real photography on Today hero. No Omni CRT/scanlines/brackets.

---

## 6. Technical system (revised)

### Client
- Expo 57 app in `mobile/`
- React Navigation tabs
- Supabase JS client (anon key + RLS); session in SecureStore
- **No** `serverUrl`, `openclawUrl`, `openclawToken`, uplink probes

### Backend (hosted)
**Supabase project** (cloud):

| Piece | Use |
|-------|-----|
| Auth | Staff accounts + JWT |
| Postgres | All business tables |
| RLS | Role-scoped row access |
| Realtime | Tickets, 86, reservation changes across iPads |
| Storage | Menu photos / house imagery later |
| Edge Functions | Webhooks, SMS, LLM assistant later |

Schema sketch (unchanged intent):  
`profiles`, `locations`, `service_periods`, `reservations`, `tables`, `menu_categories`, `menu_items`, `tickets`, `ticket_items`, `staff`, `shifts`, `inventory_items`, `stock_moves`, `guests`, `events`, `daily_closes`.

### Builds & secrets
| Secret | Where |
|--------|-------|
| `EXPO_TOKEN`, Apple API key | GitHub Actions / EAS (already) |
| `EXPO_PUBLIC_SUPABASE_URL` | EAS env / `app.config.js` extras |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | EAS env |
| Service role key | **Only** Edge Functions — never the app |

### House assistant (P2+, optional)
```
App → Supabase Edge Function → xAI/OpenAI
         ↓
    SQL / RPC over Casa data (RLS service path carefully scoped)
```
**Not** OpenClaw. **Not** a process on a PC.

### Legacy code disposition (Phase 0)

| Path | Action |
|------|--------|
| `openclaw/` | Move to `archive/legacy-omni/openclaw/` or delete in follow-up PR |
| `server/` | Move to `archive/legacy-omni/server/` or delete |
| Omni HUD components | Replace; do not skin |
| Docs mentioning LAN/Tailscale/gateway | Rewrite or delete |
| `UplinkBar`, OpenClaw SYS fields | Remove when shell lands |

---

## 7. Day-one setup for Jorge (no computer lab)

1. Create free **Supabase** project in the browser (phone OK; laptop browser OK — not a server you run).  
2. Apply SQL schema from repo (SQL editor in Supabase dashboard).  
3. Put URL + anon key into EAS secrets / Expo env.  
4. EAS Build → TestFlight (as today).  
5. Open app → sign in → use Today / Book.

If Supabase dashboard feels heavy on phone-only, Phase 0 can ship **mock local data** on TestFlight first, then wire cloud when a browser is available.

---

## 8. Open decisions

1. Single location? Restaurant + catering?  
2. Rebrand ASC app `6797235230` vs new listing?  
3. Payments: none in MVP?  
4. Auth day one: email/password vs magic link vs shared floor PIN?  
5. ~~Backend: Supabase vs self-hosted VPS~~ → **Settled: hosted Supabase (or equivalent cloud). No self-hosted.**  
6. First TestFlight: mock data only, or wait for Supabase project?

Defaults until answered: **single location, restaurant + events, rebrand in place, no payments, email auth, mock-first then Supabase.**

---

## 9. Delivery phases

### Phase 0 — Cloud-only foundations
- [x] Docs: no-Linux system replan  
- [ ] Rebrand app config + assets  
- [ ] Tab shell: Today / Book / Floor / House / More  
- [ ] Strip SYS gateway / OpenClaw / uplink  
- [ ] Mock data layer so TestFlight works offline-of-backend  
- [ ] Archive/delete `openclaw/` + Omni `server/` from product path  
- [ ] Supabase schema SQL in repo + RLS stubs  

### Phase 1 — MVP service (cloud)
- [ ] Auth + roles  
- [ ] Reservations + Today  
- [ ] Menu + 86 realtime  
- [ ] Tickets lite  
- [ ] Staff today + daily close  
- [ ] TestFlight bump  

### Phase 2 — House depth  
### Phase 3 — Growth + optional cloud assistant  

---

## 10. Success metrics

| Signal | Target |
|--------|--------|
| App usable with home PC **powered off / gone** | Always |
| Owner opens Today before service | Daily |
| Reservation without paper | 100% |
| 86 visible on all devices | < 30s |
| Daily close submitted | Every service night |

---

## 11. First implementation slice (next code)

1. Rebrand Expo shell + navigation + Today hero  
2. In-app mock store (AsyncStorage) so nothing needs a server  
3. Remove OpenClaw/legacy connect UX  
4. Add `supabase/schema.sql` + client stub behind a feature flag  
5. Archive legacy Omni server folders  

Do **not** revive LAN gateway setup. Do **not** port Omni chat.
