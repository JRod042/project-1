#!/usr/bin/env python3
"""Attach the latest iOS build to App Store Connect and submit for App Review."""
from __future__ import annotations

import json
import os
import sys
import time
from datetime import datetime, timezone

import jwt
import requests

APP_ID = os.environ.get("ASC_APP_ID", "6797235230")
BUNDLE = "com.jrod042.omni"
BASE = "https://api.appstoreconnect.apple.com/v1"
KEY_ID = os.environ["EXPO_ASC_KEY_ID"]
ISSUER = os.environ["EXPO_ASC_ISSUER_ID"]
KEY_PATH = os.environ["EXPO_ASC_API_KEY_PATH"]

PRIVACY = "https://rusticopr.com/policies/privacy-policy"
SUPPORT = "https://rusticopr.com"
PHONE = "9174761051"
EMAIL = "jorge.k.rodriguezvargas@gmail.com"
FIRST = "Jorge"
LAST = "Rodriguez"

DESC = """Casa Rústico is the shop for single-origin coffee from rusticopr.com.

Browse Colombia, Costa Rica, Brazil, Ethiopia and the rest of the short menu. Add a bag, check out in the app, and pay with Shopify — Apple Pay, Shop Pay, or card. MORNING10 takes 10% off.

Mountain mornings. The culture of the cup. Packed in the U.S."""

KEYWORDS = "coffee,shop,beans,espresso,colombia,organic,roast,casa rustico"


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


def main() -> int:
    app = api("GET", f"/apps/{APP_ID}")["data"]
    print("app:", app["attributes"].get("name"), app["id"])

    builds = api(
        "GET",
        f"/builds?filter[app]={APP_ID}&filter[processingState]=VALID&sort=-uploadedDate&limit=15",
    )["data"]
    if not builds:
        print("No VALID builds on App Store Connect yet. Wait for processing.", file=sys.stderr)
        return 2
    build = builds[0]
    battr = build["attributes"]
    print(
        "latest build:",
        battr.get("version"),
        "expired" if battr.get("expired") else "ok",
        battr.get("minOsVersion"),
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
        version_string = os.environ.get("APP_VERSION") or "0.5.7"
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

    # Select build
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
                        "whatsNew": "Casa Rústico shop: in-app Shopify checkout, mountain-mark icon, cream splash.",
                    },
                }
            },
        )
        print("updated localization", loc["attributes"].get("locale"))

    # Privacy policy on the app info localization if present
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

    # Review details
    details = api("GET", f"/appStoreVersions/{version['id']}/appStoreReviewDetail")
    detail = (details or {}).get("data")
    body = {
        "contactFirstName": FIRST,
        "contactLastName": LAST,
        "contactPhone": PHONE,
        "contactEmail": EMAIL,
        "demoAccountRequired": False,
        "notes": (
            "Customer coffee shop. Check Out opens Shopify checkout for rusticopr.com "
            "inside the app (Safari View Controller). Promo MORNING10. "
            "No login required. Add Colombia to the bag to test checkout."
        ),
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
    print("review contact set")

    # Prefer modern review submission; fall back to version submission.
    try:
        existing = api(
            "GET",
            f"/reviewSubmissions?filter[app]={APP_ID}&filter[state]=READY_FOR_REVIEW,WAITING_FOR_REVIEW,IN_REVIEW,UNRESOLVED_ISSUES",
        )["data"]
        if existing:
            print("review already in flight:", existing[0]["id"], existing[0]["attributes"].get("state"))
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
