#!/usr/bin/env python3
"""Attach the latest iOS build to App Store Connect and submit for App Review."""
from __future__ import annotations

import os
import sys
import time

import jwt
import requests

APP_ID = os.environ.get("ASC_APP_ID", "6797235230")
BUNDLE = "com.jrod042.omni"
BASE = "https://api.appstoreconnect.apple.com/v1"
KEY_ID = os.environ["EXPO_ASC_KEY_ID"]
ISSUER = os.environ["EXPO_ASC_ISSUER_ID"]
KEY_PATH = os.environ["EXPO_ASC_API_KEY_PATH"]
WANTED_BUILD = os.environ.get("APP_BUILD_NUMBER", "53")
WAIT_SECS = int(os.environ.get("ASC_BUILD_WAIT_SECS", "1200"))

PRIVACY = "https://rusticopr.com/policies/privacy-policy"
SUPPORT = "https://rusticopr.com"
PHONE = "9174761051"
EMAIL = "jorge.k.rodriguezvargas@gmail.com"
FIRST = "Jorge"
LAST = "Rodriguez"

DEMO_EMAIL = "appreview@rusticopr.com"
DEMO_PASSWORD = "CasaReview-51!"

DESC = """Casa Rústico is the shop for single-origin coffee from rusticopr.com.

Browse Colombia, Costa Rica, Brazil, Ethiopia and the rest of the short menu. Add a bag, check out in the app, and pay with Shopify — Apple Pay, Shop Pay, or card. MORNING10 takes 10% off.

No account is required to browse or check out. Sign in on the You tab is optional and uses the same Shopify customer as rusticopr.com.

Mountain mornings. The culture of the cup. Packed in the U.S."""

KEYWORDS = "coffee,shop,beans,espresso,colombia,organic,roast,casa rustico"

REVIEW_NOTES = f"""Guideline replies for this binary (build {WANTED_BUILD}):

2.1 — Demo account (works; Shopify customer, live-tested):
Username: {DEMO_EMAIL}
Password: {DEMO_PASSWORD}
Path: You tab → Sign in → enter the demo account. Sign-in is optional.

Guest path (no login): Home or Order → pick any origin bag → Add to bag → Review bag → Check Out.
Checkout is Shopify Checkout Sheet inside the app for rusticopr.com (physical coffee shipped to an address). Promo MORNING10.

This app does NOT use In-App Purchase. It sells physical goods (bags of coffee, mug, capsules) fulfilled by Shopify. Payment is Shopify checkout, not IAP. Guideline 3.1.3(e) / 3.1.5 goods and services.

5.1.1 — Registration is not required. Splash is “Enter the shop”, not a login wall. Home, Order, Rewards, bag, and checkout all work as a guest. You tab copy: “Shop as a guest anytime. Sign in only if you want Shopify orders here.”

Please test on iPhone or iPad. Content is visible immediately after the kraft splash (Home / Order / Rewards / You).
"""


def token() -> str:
    with open(KEY_PATH) as f:
        key = f.read()
    now = int(time.time())
    return jwt.encode(
        {"iss": ISSUER, "iat": now, "exp": now + 19 * 60, "aud": "appstoreconnect-v1"},
        key,
        algorithm="ES256",
        headers={"alg": "ES256", "kid": KEY_ID, "typ": "JWT"},
    )


S = requests.Session()


def headers():
    return {
        "Authorization": f"Bearer {token()}",
        "Content-Type": "application/json",
    }


def api(method: str, path: str, **kwargs):
    url = path if path.startswith("http") else BASE + path
    r = S.request(method, url, headers=headers(), timeout=60, **kwargs)
    if r.status_code >= 400:
        print(f"ASC {method} {url} -> {r.status_code}", file=sys.stderr)
        print(r.text[:4000], file=sys.stderr)
        r.raise_for_status()
    if r.status_code == 204 or not r.content:
        return None
    return r.json()


def find_wanted_build():
    builds = api(
        "GET",
        f"/builds?filter[app]={APP_ID}&filter[version]={WANTED_BUILD}&sort=-uploadedDate&limit=15",
    )["data"]
    valid = [
        b
        for b in builds
        if b["attributes"].get("processingState") == "VALID" and not b["attributes"].get("expired")
    ]
    if valid:
        return valid[0], builds
    return None, builds


def wait_for_wanted_build():
    deadline = time.time() + WAIT_SECS
    while True:
        build, all_builds = find_wanted_build()
        states = [b["attributes"].get("processingState") for b in all_builds]
        print(f"build {WANTED_BUILD} states: {states or ['none']}")
        if build:
            return build
        if time.time() >= deadline:
            return None
        time.sleep(20)


def main() -> int:
    app = api("GET", f"/apps/{APP_ID}")["data"]
    print("app:", app["attributes"].get("name"), app["id"], "bundle", BUNDLE)

    build = wait_for_wanted_build()
    if build is None:
        print(
            f"No VALID App Store Connect build with CFBundleVersion {WANTED_BUILD} yet. "
            "Not attaching an older binary.",
            file=sys.stderr,
        )
        return 2
    battr = build["attributes"]
    print(
        "using build:",
        battr.get("version"),
        battr.get("processingState"),
        "expired" if battr.get("expired") else "ok",
        battr.get("uploadedDate"),
    )

    versions = api(
        "GET",
        f"/apps/{APP_ID}/appStoreVersions?filter[platform]=IOS&limit=20",
    )["data"]
    editable = {
        "PREPARE_FOR_SUBMISSION",
        "DEVELOPER_REJECTED",
        "REJECTED",
        "METADATA_REJECTED",
        "INVALID_BINARY",
    }
    version = next((v for v in versions if v["attributes"]["appStoreState"] in editable), None)
    if version is None:
        version_string = os.environ.get("APP_VERSION") or "1.0.0"
        created = api(
            "POST",
            "/appStoreVersions",
            json={
                "data": {
                    "type": "appStoreVersions",
                    "attributes": {
                        "platform": "IOS",
                        "versionString": version_string,
                        "releaseType": "AFTER_APPROVAL",
                    },
                    "relationships": {
                        "app": {"data": {"type": "apps", "id": APP_ID}},
                    },
                }
            },
        )
        version = created["data"]
        print("created version", version_string, version["id"])
    else:
        print(
            "using version",
            version["attributes"]["versionString"],
            version["attributes"]["appStoreState"],
            version["id"],
        )
        api(
            "PATCH",
            f"/appStoreVersions/{version['id']}",
            json={
                "data": {
                    "type": "appStoreVersions",
                    "id": version["id"],
                    "attributes": {"releaseType": "AFTER_APPROVAL"},
                }
            },
        )

    api(
        "PATCH",
        f"/appStoreVersions/{version['id']}/relationships/build",
        json={"data": {"type": "builds", "id": build["id"]}},
    )
    print("attached build", build["id"])

    locs = api("GET", f"/appStoreVersions/{version['id']}/appStoreVersionLocalizations")["data"]
    loc = next((l for l in locs if l["attributes"].get("locale", "").startswith("en")), locs[0] if locs else None)
    if loc:
        api(
            "PATCH",
            f"/appStoreVersionLocalizations/{loc['id']}",
            json={
                "data": {
                    "type": "appStoreVersionLocalizations",
                    "id": loc["id"],
                    "attributes": {
                        "description": DESC,
                        "keywords": KEYWORDS,
                        "supportUrl": SUPPORT,
                        "marketingUrl": SUPPORT,
                        "whatsNew": (
                            "Guest shop with optional Shopify sign-in. Apple Review demo account "
                            "on the You tab. In-app Shopify checkout for physical coffee. No IAP."
                        ),
                    },
                }
            },
        )
        print("updated localization", loc["attributes"].get("locale"))

    infos = api("GET", f"/apps/{APP_ID}/appInfos")["data"]
    if infos:
        info_locs = api("GET", f"/appInfos/{infos[0]['id']}/appInfoLocalizations")["data"]
        for il in info_locs:
            if il["attributes"].get("locale", "").startswith("en") or len(info_locs) == 1:
                api(
                    "PATCH",
                    f"/appInfoLocalizations/{il['id']}",
                    json={
                        "data": {
                            "type": "appInfoLocalizations",
                            "id": il["id"],
                            "attributes": {
                                "privacyPolicyUrl": PRIVACY,
                                "name": "Casa Rústico",
                                "subtitle": "Single-origin coffee",
                            },
                        }
                    },
                )
                print("privacy + name set")
                break

    details = api("GET", f"/appStoreVersions/{version['id']}/appStoreReviewDetail")
    detail = (details or {}).get("data")
    body = {
        "contactFirstName": FIRST,
        "contactLastName": LAST,
        "contactPhone": PHONE,
        "contactEmail": EMAIL,
        "demoAccountRequired": True,
        "demoAccountName": DEMO_EMAIL,
        "demoAccountPassword": DEMO_PASSWORD,
        "notes": REVIEW_NOTES,
    }
    if detail:
        api(
            "PATCH",
            f"/appStoreReviewDetails/{detail['id']}",
            json={
                "data": {
                    "type": "appStoreReviewDetails",
                    "id": detail["id"],
                    "attributes": body,
                }
            },
        )
    else:
        api(
            "POST",
            "/appStoreReviewDetails",
            json={
                "data": {
                    "type": "appStoreReviewDetails",
                    "attributes": body,
                    "relationships": {
                        "appStoreVersion": {
                            "data": {"type": "appStoreVersions", "id": version["id"]}
                        }
                    },
                }
            },
        )
    print("review contact + demo account set")

    try:
        existing = api(
            "GET",
            f"/reviewSubmissions?filter[app]={APP_ID}&filter[state]=WAITING_FOR_REVIEW,IN_REVIEW&limit=10",
        )["data"]
        if existing:
            print(
                "review already in flight:",
                existing[0]["id"],
                existing[0]["attributes"].get("state"),
            )
            return 0
        created = api(
            "POST",
            "/reviewSubmissions",
            json={
                "data": {
                    "type": "reviewSubmissions",
                    "attributes": {"platform": "IOS"},
                    "relationships": {"app": {"data": {"type": "apps", "id": APP_ID}}},
                }
            },
        )["data"]
        api(
            "POST",
            "/reviewSubmissionItems",
            json={
                "data": {
                    "type": "reviewSubmissionItems",
                    "relationships": {
                        "reviewSubmission": {
                            "data": {"type": "reviewSubmissions", "id": created["id"]}
                        },
                        "appStoreVersion": {
                            "data": {"type": "appStoreVersions", "id": version["id"]}
                        },
                    },
                }
            },
        )
        api(
            "PATCH",
            f"/reviewSubmissions/{created['id']}",
            json={
                "data": {
                    "type": "reviewSubmissions",
                    "id": created["id"],
                    "attributes": {"submitted": True},
                }
            },
        )
        print("SUBMITTED FOR APP REVIEW via reviewSubmissions", created["id"])
        return 0
    except requests.HTTPError as e:
        print("reviewSubmissions failed, trying appStoreVersionSubmissions", e)
        api(
            "POST",
            "/appStoreVersionSubmissions",
            json={
                "data": {
                    "type": "appStoreVersionSubmissions",
                    "relationships": {
                        "appStoreVersion": {
                            "data": {"type": "appStoreVersions", "id": version["id"]}
                        }
                    },
                }
            },
        )
        print("SUBMITTED FOR APP REVIEW via appStoreVersionSubmissions")
        return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except requests.HTTPError:
        raise SystemExit(1)
