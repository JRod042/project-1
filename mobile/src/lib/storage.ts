import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import type { AppSettings, ProviderName } from "../types";

const SETTINGS_KEY = "omni.settings.v1";
const API_KEY_SECURE = "omni.apiKey";

const defaults: AppSettings = {
  serverUrl: "http://127.0.0.1:8787",
  provider: "xai",
  model: "grok-4",
  apiKey: "",
  autoApprove: false,
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<AppSettings>) : {};
    let apiKey = "";
    try {
      apiKey = (await SecureStore.getItemAsync(API_KEY_SECURE)) || "";
    } catch {
      apiKey = parsed.apiKey || "";
    }
    return {
      ...defaults,
      ...parsed,
      apiKey,
      provider: (parsed.provider as ProviderName) || defaults.provider,
    };
  } catch {
    return { ...defaults };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const { apiKey, ...rest } = settings;
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(rest));
  try {
    if (apiKey) {
      await SecureStore.setItemAsync(API_KEY_SECURE, apiKey);
    } else {
      await SecureStore.deleteItemAsync(API_KEY_SECURE);
    }
  } catch {
    // SecureStore unavailable (web/dev) — fall back to async storage
    await AsyncStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ ...rest, apiKey })
    );
  }
}
