import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import type { AppSettings, ProviderName } from "../types";

const SETTINGS_KEY = "omni.settings.v1";
const API_KEY_SECURE = "omni.apiKey";
const SERVER_TOKEN_SECURE = "omni.serverToken";

/** Prefer the Metro/dev-client host so a physical device hits your machine on LAN. */
export function defaultServerUrl(): string {
  const hostUri = Constants.expoConfig?.hostUri || Constants.linkingUri || "";

  const match = String(hostUri).match(
    /(?:^|\/\/)((?:\d{1,3}\.){3}\d{1,3}|[a-zA-Z0-9.-]+)(?::\d+)?/
  );
  const host = match?.[1];

  if (host && host !== "localhost" && host !== "127.0.0.1") {
    return `http://${host}:8787`;
  }

  // Loopback only works on Simulator. On a real iPhone/iPad, set SYS → server URL.
  return "http://127.0.0.1:8787";
}

const defaults = (): AppSettings => ({
  serverUrl: defaultServerUrl(),
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
    try {
      apiKey = (await SecureStore.getItemAsync(API_KEY_SECURE)) || "";
      serverToken =
        (await SecureStore.getItemAsync(SERVER_TOKEN_SECURE)) || "";
    } catch {
      apiKey = parsed.apiKey || "";
      serverToken = parsed.serverToken || "";
    }

    // If user never customized server URL, refresh LAN default from current host.
    const serverUrl =
      !parsed.serverUrl ||
      parsed.serverUrl === "http://127.0.0.1:8787" ||
      parsed.serverUrl === "http://localhost:8787"
        ? base.serverUrl
        : parsed.serverUrl;

    return {
      ...base,
      ...parsed,
      serverUrl,
      apiKey,
      serverToken,
      provider: (parsed.provider as ProviderName) || base.provider,
    };
  } catch {
    return base;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const { apiKey, serverToken, ...rest } = settings;
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
  } catch {
    await AsyncStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ ...rest, apiKey, serverToken })
    );
  }
}
