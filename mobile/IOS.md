# Casa Rustico — iOS / Android store

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

## Production (live stores)

GitHub Actions → **Casa Rústico store** · profile **production** · submit **true**.

| Store | What EAS does | What you still do |
| --- | --- | --- |
| iPhone | Uploads the binary to App Store Connect. After processing it appears in TestFlight. | App Store Connect → version 1.0.0 → select this build → **Submit for Review**. Apple does not auto-release. |
| Android | Uploads the AAB to Play **production** and completes the release. | Play Console must already have the listing (privacy, content rating, store listing). First-ever Play upload had to be manual; after that this path is live. |

Current store build: **49**.

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

## Build + TestFlight / Play

1. Expo → **@jrod42/omni** → **Builds** → **Build from GitHub**
2. Branch: **`main`** (latest)
3. Platform: **iOS** and **Android** · Profile: **production**
4. Wait for a **green build**
5. iOS: open that build → **Submit** to App Store Connect if Actions did not auto-submit
6. App Store Connect → Activity → TestFlight → Ready to Test, then **Submit for Review** for the live store
7. On device: TestFlight → install **Casa Rustico** until Apple approves the public listing

### If submit says the build number was already used

Bump `ios.buildNumber` and `android.versionCode` together in `mobile/app.config.js`, commit, rebuild, then submit again.  
`autoIncrement` is **not** enabled. Current value on this branch: **49**.

---

## After install

Open the app → kraft seal → shop → Colombia → add a bag → **Check Out**. Shopify checkout opens over the app. Promo **MORNING10**.

---

## Notes

- Bundle stays `com.jrod042.omni` for continuity with the existing ASC listing.
- Never change bundle IDs unless you intend a new listing.
- Checkout is Shopify Checkout Kit + WebView fallback. Kit and Liquid Glass are native modules — both platforms must ship the same binary.
