import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import type { AppSettings, ProviderName, RuntimeMode } from "../types";
export { isLoopbackServerUrl } from "./urls";
import { isLoopbackServerUrl } from "./urls";

const SETTINGS_KEY = "omni.settings.v1";
const API_KEY_SECURE = "omni.apiKey";
const SERVER_TOKEN_SECURE = "omni.serverToken";
const OPENCLAW_TOKEN_SECURE = "omni.openclawToken";

function lanHost(): string | null {
  const hostUri = Constants.expoConfig?.hostUri || Constants.linkingUri || "";
  const match = String(hostUri).match(
    /(?:^|\/\/)((?:\d{1,3}\.){3}\d{1,3}|[a-zA-Z0-9.-]+)(?::\d+)?/
  );
  const host = match?.[1];
  if (host && host !== "localhost" && host !== "127.0.0.1") return host;
  return null;
}

/** Prefer the Metro/dev-client host so a physical device hits your machine on LAN. */
export function defaultServerUrl(): string {
  const host = lanHost();
  if (host) return `http://${host}:8787`;
  // TestFlight / store builds have no Metro host — user must set SYS → LAN/tunnel URL.
  return "http://127.0.0.1:8787";
}

/**
 * Prefer a LAN host from Metro/dev when available.
 * Otherwise leave empty — localhost is useless on a physical iPad.
 */
export function defaultOpenclawUrl(): string {
  const host = lanHost();
  if (host) return `http://${host}:18789`;
  return "";
}

const defaults = (): AppSettings => ({
  runtimeMode: "openclaw",
  serverUrl: defaultServerUrl(),
  openclawUrl: defaultOpenclawUrl(),
  openclawToken: "",
  provider: "xai",
  model: "grok-4.5",
  apiKey: "",
  serverToken: "",
  autoApprove: false,
});

export async function loadSettings(): Promise<AppSettings> {
  const base = defaults();
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<AppSettings>) : {};
    let apiKey = "";
    let serverToken = "";
    let openclawToken = "";
    try {
      apiKey = (await SecureStore.getItemAsync(API_KEY_SECURE)) || "";
      serverToken =
        (await SecureStore.getItemAsync(SERVER_TOKEN_SECURE)) || "";
      openclawToken =
        (await SecureStore.getItemAsync(OPENCLAW_TOKEN_SECURE)) || "";
    } catch {
      apiKey = parsed.apiKey || "";
      serverToken = parsed.serverToken || "";
      openclawToken = parsed.openclawToken || "";
    }

    // Keep a saved custom URL. Only refresh when unset / still loopback default.
    const savedServer = parsed.serverUrl?.trim() || "";
    const serverUrl =
      !savedServer || isLoopbackServerUrl(savedServer)
        ? base.serverUrl
        : savedServer;

    // Migrate stale loopback OpenClaw defaults; physical devices need LAN/Tailscale.
    const savedOpenclaw = parsed.openclawUrl?.trim() || "";
    const openclawUrl =
      !savedOpenclaw || isLoopbackServerUrl(savedOpenclaw)
        ? base.openclawUrl
        : savedOpenclaw;

    return {
      ...base,
      ...parsed,
      serverUrl,
      openclawUrl,
      apiKey,
      serverToken,
      openclawToken,
      runtimeMode: (parsed.runtimeMode as RuntimeMode) || base.runtimeMode,
      provider: (parsed.provider as ProviderName) || base.provider,
    };
  } catch {
    return base;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const { apiKey, serverToken, openclawToken, ...rest } = settings;
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(rest));
  try {
    if (apiKey) {
      await SecureStore.setItemAsync(API_KEY_SECURE, apiKey);
    } else {
      await SecureStore.deleteItemAsync(API_KEY_SECURE);
    }
    if (serverToken) {
      await SecureStore.setItemAsync(SERVER_TOKEN_SECURE, serverToken);
    } else {
      await SecureStore.deleteItemAsync(SERVER_TOKEN_SECURE);
    }
    if (openclawToken) {
      await SecureStore.setItemAsync(OPENCLAW_TOKEN_SECURE, openclawToken);
    } else {
      await SecureStore.deleteItemAsync(OPENCLAW_TOKEN_SECURE);
    }
  } catch {
    await AsyncStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ ...rest, apiKey, serverToken, openclawToken })
    );
  }
}
