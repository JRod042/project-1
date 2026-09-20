#!/usr/bin/env node
/**
 * Capture Shop home + Colombia product at App Store screenshot sizes.
 *
 * Requires Expo web already serving (default http://localhost:8081):
 *   cd mobile && npx expo start --web --port 8081
 *   node scripts/capture-asc-screenshots.mjs
 *
 * Output (gitignored + agent artifacts):
 *   mobile/artifacts/asc-screenshots/
 *   /opt/cursor/artifacts/asc-screenshots/  (when that dir exists)
 */

import { mkdir, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.env.ASC_OUT || path.join(ROOT, "artifacts", "asc-screenshots");
const AGENT_OUT = "/opt/cursor/artifacts/asc-screenshots";
const BASE = process.env.EXPO_WEB_URL || "http://localhost:8081";

/** Logical points × scale = Apple's listed pixel sizes. */
const DEVICES = [
  { id: "iphone-65", width: 428, height: 926, scale: 3, pixels: "1284x2778" },
  { id: "ipad-13", width: 1024, height: 1366, scale: 2, pixels: "2048x2732" },
];

async function waitForServer(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Expo web not reachable at ${url}. Start with: npx expo start --web --port 8081`);
}

async function enterShop(page) {
  await page.waitForTimeout(1800);
  const skip = page.getByLabel("Skip");
  const start = page.getByRole("button", { name: /get started/i });
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
  } else if (await start.isVisible().catch(() => false)) {
    await start.click();
  }
  await page.getByText("Shop", { exact: true }).first().waitFor({ timeout: 20000 });
}

async function waitImages(page) {
  await page.waitForTimeout(800);
  await page.evaluate(async () => {
    const imgs = [...document.images];
    await Promise.all(
      imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.addEventListener("load", resolve, { once: true });
              img.addEventListener("error", resolve, { once: true });
            }),
      ),
    );
  });
}

async function save(page, dests, name) {
  const file = `${name}.png`;
  const primary = path.join(dests[0], file);
  await page.screenshot({ path: primary, fullPage: false, type: "png" });
  for (const extra of dests.slice(1)) {
    await copyFile(primary, path.join(extra, file));
  }
  return dests.map((d) => path.join(d, file));
}

async function main() {
  await waitForServer(BASE);
  await mkdir(OUT, { recursive: true });
  const dests = [OUT];
  if (existsSync("/opt/cursor/artifacts")) {
    await mkdir(AGENT_OUT, { recursive: true });
    dests.push(AGENT_OUT);
  }

  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || undefined,
    args: ["--disable-dev-shm-usage"],
  });

  const written = [];
  for (const d of DEVICES) {
    const context = await browser.newContext({
      viewport: { width: d.width, height: d.height },
      deviceScaleFactor: d.scale,
      isMobile: d.id.startsWith("iphone"),
      hasTouch: true,
    });
    const page = await context.newPage();
    await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
    await enterShop(page);
    await waitImages(page);
    written.push(...(await save(page, dests, `${d.id}-shop-home`)));

    await page.getByText("Colombia", { exact: true }).first().click();
    await page.getByText("Add to bag").first().waitFor({ timeout: 15000 });
    await waitImages(page);
    written.push(...(await save(page, dests, `${d.id}-product-colombia`)));

    await context.close();
  }

  await browser.close();
  console.log("Wrote ASC screenshots:");
  for (const f of written) console.log(`  ${f}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
