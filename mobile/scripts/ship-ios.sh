#!/usr/bin/env bash
# Ship Omni to TestFlight using your Apple Developer account via EAS.
# Run this on your Mac (or any machine with network + browser login).
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Omni iOS ship"
echo "Bundle ID: com.jrod042.omni"
echo

if ! npx eas whoami >/dev/null 2>&1; then
  echo "Log into Expo (EAS builds your IPA on Mac builders):"
  npx eas login
fi

if ! node -e "const c=require('./app.config.js'); if(!c.extra?.eas?.projectId && !process.env.EAS_PROJECT_ID) process.exit(1)" 2>/dev/null; then
  echo "Linking this app to your Expo account…"
  npx eas init
fi

PROFILE="${1:-production}"
echo "Building iOS profile: ${PROFILE}"
echo "EAS will ask for Apple Developer login to create certs + provisioning."
echo

npx eas build --platform ios --profile "${PROFILE}" --non-interactive=false

echo
echo "Submit to TestFlight? (needs App Store Connect app created first)"
read -r -p "Run eas submit now? [y/N] " ans
if [[ "${ans:-}" =~ ^[Yy]$ ]]; then
  if [[ -z "${ASC_APP_ID:-}" ]]; then
    echo "Tip: export ASC_APP_ID=1234567890  (App Store Connect → App → App Information → Apple ID)"
  fi
  npx eas submit --platform ios --profile "${PROFILE}" --latest
fi

echo
echo "Done. Install from TestFlight on your iPhone once processing finishes."
