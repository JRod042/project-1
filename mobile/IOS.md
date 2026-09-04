# Casa Rustico — iOS / TestFlight

**Display name:** Casa Rustico  
**Bundle ID:** `com.jrod042.omni`  
**Expo project:** `@jrod42/omni`  
**Apple Team:** `FY5H9V76QL`  
**GitHub base directory:** `mobile`  
**ASC App ID:** `6797235230`

You do **not** need a Mac or any home server.

---

## What this build is

Casa Rústico **customer shop** (Shop / Ritual / You / Bag).  
Checkout is **Shopify Checkout Kit** (native sheet, present-on-tap). Pay is an in-app button. No Safari, no Shop app. Kraft splash on every launch.  
Chrome is **Apple Liquid Glass** (`expo-glass-effect`) on iOS 26+ / iOS 27; frost fallback on older iOS and Android. Kraft cards stay solid.

---

## Before you build (checklist)

1. App ID `com.jrod042.omni` exists in Apple Identifiers
2. App exists in App Store Connect with that bundle ID
3. Expo credentials complete for the bundle:
   - Distribution Certificate
   - App Store Provisioning Profile
4. GitHub linked in Expo project settings with **base directory = `mobile`**

### Credentials (if missing / invalid)

1. Open [expo.dev/accounts/jrod42/projects/omni/credentials](https://expo.dev/accounts/jrod42/projects/omni/credentials)
2. iOS → App Store for `com.jrod042.omni`
3. Generate / validate **Distribution Certificate**
4. Generate / validate **App Store Provisioning Profile**

---

## Build + TestFlight

1. Expo → **@jrod42/omni** → **Builds** → **Build from GitHub**
2. Branch: **`main`** (latest)
3. Platform: **iOS** · Profile: **production**
4. Wait for a **green build**
5. Open that build → **Submit** to App Store Connect (**required** — green Expo build ≠ TestFlight)
6. App Store Connect → Activity → TestFlight → Ready to Test
7. On device: open **TestFlight** → install **Casa Rustico**

### If submit says the build number was already used

Bump `ios.buildNumber` and `android.versionCode` together in `mobile/app.config.js`, commit, rebuild, then submit again.  
`autoIncrement` is **not** enabled. Current value on this branch: **49**.

### If the build is green but nothing appears in TestFlight

You almost always have not submitted yet.

1. Open the finished production build on Expo
2. Tap **Submit**
3. Check App Store Connect → Activity for Processing

---

## After install

Open the app → Welcome → Enter the shop → Colombia hero → add a bag → **Check Out**. Shopify checkout opens over the app. Close returns to the bag. Promo **MORNING10**. Close returns to the bag; a completed order returns to the shop.

---

## Notes

- Bundle stays `com.jrod042.omni` for continuity with the existing ASC listing.
- Never change `eas.json` / bundle IDs unless you intend a new listing.
- Prefer Expo browser **Build → Submit** until GitHub Actions is confirmed green.
- Checkout is Shopify Checkout Kit + WebView fallback. A new EAS iOS **and** Android production build is required for TestFlight (build **49**). Kit and Liquid Glass are native modules — both platforms must ship the same binary.
