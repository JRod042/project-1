# Prompt 06 — Pre-ship iOS verification (Cursor + human Expo UI)

---

@00_CONTEXT_AND_RULES.md

You cannot log into Apple/Expo as the user. Prepare the repo so **the human** can ship with zero ambiguity.

## Your tasks

1. Run / fix `mobile` preflight scripts from Prompt 02.
2. Bump `ios.buildNumber` if shipping a new binary.
3. Ensure `mobile/IOS.md` is the single source of truth with:
   - Expo credentials steps (Distribution + App Store profile)
   - Build from GitHub steps
   - TestFlight install on **iPhone**
   - SYS server connection (LAN IP vs public URL)
   - Troubleshooting table (credentials, pods, privacy manifest, ATS, TEST LINK fail)
4. Add `mobile/SHIPCHECK.md` with a copy-paste checklist for the human.
5. If GitHub Actions exists, document required secrets: `EXPO_TOKEN`, optional ASC API key vars — names only.
6. Confirm `.gitignore` excludes `.env`, credentials, `*.p8`, `google-services.json` if any.

## Human steps (include verbatim in SHIPCHECK.md)

1. Expo credentials valid for `com.jrod042.omni`
2. `git push` latest main
3. Expo → Build from GitHub → main → iOS → production
4. Submit to TestFlight
5. Install on iPhone via TestFlight
6. Start `server` with `XAI_API_KEY`
7. SYS → URL → token → TEST LINK → send “Briefing”

## Done when

- Docs + scripts are accurate against current config files
- You list any remaining manual-only steps clearly

