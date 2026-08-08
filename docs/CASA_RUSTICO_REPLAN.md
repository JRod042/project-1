# Casa Rustico — product replan

Replaces the Omni personal-operator north star with an **all-around business app** for Casa Rustico.

> Assumption: Casa Rustico is a hospitality house (restaurant / events / catering). If the business mix differs (café-only, multi-location, retail), adjust module priority in §7 — the shell stays the same.

---

## 1. Why pivot

Omni solved “agent on my phone.” Casa Rustico needs “**run my business on my phone/iPad**.”

| Omni (old) | Casa Rustico (new) |
|------------|--------------------|
| Operator terminal + tools | Business HQ + service workflows |
| OpenClaw / SSE agent brain | Business data + roles + optional house assistant |
| Dark cyber HUD | Warm rustic hospitality brand |
| Single timeline chat | Tabbed ops surfaces (Today, Book, Floor, House, More) |

**Keep:** Expo mobile, EAS/TestFlight, Apple team wiring, SecureStore secrets pattern, typecheck discipline.  
**Scrap as product UI:** Atmosphere HUD, TerminalLine timeline-as-home, SYS-as-gateway console, OpenClaw-as-primary surface.  
**Optional reuse:** thin assistant that can query house data / draft messages — never the home screen.

---

## 2. Personas & jobs

| Persona | Primary jobs |
|---------|----------------|
| **Owner** | Today P&L pulse, reservations health, staff coverage, daily close, promos |
| **Manager / maître d’** | Book table, seat party, waitlist, floor notes, comps |
| **Kitchen** | Ticket rail, 86 items, prep lists, low-stock flags |
| **Floor staff** | Assigned tables, course timing, guest notes |
| **Catering / events** | Leads, menus, deposits, event day checklist |
| **Guest** (later) | Reserve, view menu, pay deposit — separate light surface |

---

## 3. Information architecture

Five roots (iPad-first; phone collapses to same tabs):

1. **Today** — one composition: date, covers booked, open tickets, staff on, money pulse, one CTA (“Seat next” / “New reservation”)
2. **Book** — reservations, waitlist, parties, private dining
3. **Floor** — table map / sections, open tickets, course status, 86 board
4. **House** — menu, inventory, staff schedule, vendors, events
5. **More** — guests CRM, reports, settings, house assistant

Hero rule: first viewport of **Today** = brand + today’s headline number + one sentence + one CTA group + one real visual (dining room / plate / patio). No stat strips of six KPIs in the hero.

---

## 4. Module map (all-around)

### P0 — MVP (shippable house)
| Module | Must have |
|--------|-----------|
| **Auth & roles** | Owner / manager / staff; PIN or Apple ID + role |
| **Today board** | Covers, next arrivals, open tickets count, who is on |
| **Reservations** | Create / edit / seat / no-show / cancel; party size; notes |
| **Menu** | Categories, items, price, 86 toggle, allergens |
| **Tickets (lite)** | Open ticket → items → send → fire → close (no full POS fiscal yet) |
| **Staff roster** | Who works today; simple shift list |
| **Daily close** | Covers, sales total (manual or import), notes, cash tip pool |
| **Settings** | House name, hours, timezone, service periods |

### P1 — Operations depth
| Module | Adds |
|--------|------|
| **Table map** | Sections + seats; assign reservation → table |
| **Waitlist** | Quote time, SMS/link later |
| **Inventory** | Par levels, low stock, receive delivery |
| **Vendors** | Contacts + last order |
| **Schedule** | Week view; claim / swap (manager approve) |
| **Guests CRM** | Preferences, allergies, visit history, VIP |
| **Events / catering** | Lead → proposal → deposit → event day |

### P2 — Growth & money
| Module | Adds |
|--------|------|
| **Reports** | Sales by day/item, labor vs covers, no-show rate |
| **Promos** | House specials, push/share cards |
| **Payments hooks** | Stripe Terminal / Square / Toast import (choose one integration lane) |
| **Guest reserve web** | Public booking page → same Book DB |
| **House assistant** | “What’s 86’d?”, “Cover count Saturday?”, draft guest SMS — data-scoped |

Out of scope for v1: full certified POS, payroll tax engine, multi-brand franchise console.

---

## 5. Brand & design direction

**Name:** Casa Rustico  
**Signal:** rustic Italian house — wood, linen, olive, terracotta clay *used carefully* (avoid the generic “cream + terracotta AI landing” look by pairing with real photography of the room/food and a distinctive display face).

| Token | Direction |
|-------|-----------|
| Display | Expressive serif or humanist display (e.g. Fraunces / Literata) — not Inter |
| Body / UI | Clean grotesque for ops density (e.g. Source Sans 3) |
| Base | Deep olive-ink / warm charcoal night for service mode; light linen day mode optional later |
| Accent | Aged brass + leaf green (not acid lime, not purple) |
| Imagery | Real dining room, plate, patio — full-bleed on marketing/Today hero only |
| Motion | Soft cover reveal, ticket slide-in, reservation confirm — 2–3 intentional motions |

**Do not** port Omni’s CRT/scanline/cyber brackets into Casa Rustico chrome.

---

## 6. Technical plan

### Keep from this repo
- `mobile/` Expo 57 + EAS + `mobile/IOS.md` ship path
- Apple team `FY5H9V76QL` / existing Expo project (rebrand in place **or** new ASC app — decide in §7)
- SecureStore / settings patterns
- Typecheck + small pure lib tests

### Replace
- `mobile/App.tsx` single terminal → React Navigation (tabs) + feature screens
- `mobile/src/components/*` HUD → business components
- `mobile/src/theme.ts` → Casa Rustico tokens
- `mobile/app.config.js` name/slug/scheme/bundle/display name/splash
- Docs north star (this file + `NORTH_STAR.md`)

### Backend (recommended)
**Supabase (Postgres + Auth + Realtime)** or equivalent hosted Postgres:

| Table (sketch) | Purpose |
|----------------|---------|
| `profiles` | user ↔ role |
| `locations` | single house now; multi later |
| `service_periods` | lunch / dinner |
| `reservations` | book / seat / status |
| `tables` | floor map |
| `menu_categories` / `menu_items` | menu + 86 |
| `tickets` / `ticket_items` | floor/kitchen lite |
| `staff` / `shifts` | roster |
| `inventory_items` / `stock_moves` | P1 |
| `guests` | CRM |
| `events` | catering |
| `daily_closes` | end of night |

API surface: Supabase client from Expo **or** thin Hono `server/` BFF if secrets/policies need a middle tier.

### Agent layer (optional, later)
Repurpose OpenClaw only as **House Assistant** with tools: `list_reservations`, `get_86`, `draft_guest_message`, `summarize_daily_close`. Not the default tab.

### Legacy disposition
| Path | Action |
|------|--------|
| `openclaw/` | Archive or keep as optional assistant; remove from primary README path |
| `server/` agent tools | Freeze; do not grow Omni tools. New BFF only if needed |
| Omni bundle `com.jrod042.omni` | **Decision A:** rename in place to Casa Rustico (same ASC app) · **B:** new bundle + new ASC app (cleaner brand, new listing) |

---

## 7. Open decisions (need Jorge)

1. **Which Casa Rustico?** Single location? Restaurant only, or catering too? Confirm hours, timezone, party size rules.
2. **Bundle identity:** keep ASC app `6797235230` and rebrand, or new App Store listing?
3. **Payments:** none in MVP, or already on Square/Toast/Clover to import?
4. **Guest SMS:** Twilio later, or email-only at first?
5. **Staff auth:** shared floor PIN vs individual logins day one?
6. **Backend preference:** Supabase vs self-hosted Postgres on existing VPS?

Until answered, implementation assumes: **single location, restaurant + events, Decision A rebrand in place, no payments in MVP, individual logins, Supabase.**

---

## 8. Delivery phases

### Phase 0 — Foundations (this replan → code shell)
- [ ] Lock north star + brand tokens
- [ ] Rebrand `app.config.js` + assets (icon/splash)
- [ ] Add navigation shell: Today / Book / Floor / House / More
- [ ] Stub screens with real copy; remove terminal as home
- [ ] Choose backend; wire auth + empty schema

### Phase 1 — MVP service
- [ ] Reservations CRUD + Today arrivals
- [ ] Menu + 86
- [ ] Tickets lite + kitchen rail
- [ ] Staff today + daily close
- [ ] TestFlight build (`buildNumber` bump)

### Phase 2 — House depth
- [ ] Table map, waitlist, inventory, schedule, guests, events

### Phase 3 — Growth
- [ ] Reports, promos, payment/import lane, public booking, house assistant

---

## 9. Success metrics

| Signal | Target |
|--------|--------|
| Owner opens **Today** before service | Daily habit |
| Reservation created without paper | 100% of bookings in-app |
| 86 item visible to floor + kitchen | < 30s after toggle |
| Daily close submitted | Every service night |
| Staff training time | < 15 minutes to seat a party |

---

## 10. First implementation slice (when approved)

1. Update README + brand assets to Casa Rustico  
2. Navigation shell + Today hero (brand-first)  
3. Local mock data for reservations/menu so UI is reviewable on TestFlight without backend  
4. Supabase schema migration + auth  
5. Wire Book + Menu for real data  

Do **not** start by porting Omni chat into a restaurant skin.
