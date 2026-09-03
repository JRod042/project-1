import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "casa.checkout.v1";

export type Fulfillment = "pickup" | "ship";

export type CheckoutPrefs = {
  name: string;
  email: string;
  phone: string;
  fulfillment: Fulfillment;
};

export const defaultPrefs: CheckoutPrefs = {
  name: "",
  email: "",
  phone: "",
  fulfillment: "ship",
};

export async function loadCheckoutPrefs(): Promise<CheckoutPrefs> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return defaultPrefs;
    const parsed = JSON.parse(raw) as Partial<CheckoutPrefs>;
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      email: typeof parsed.email === "string" ? parsed.email : "",
      phone: typeof parsed.phone === "string" ? parsed.phone : "",
      fulfillment: parsed.fulfillment === "pickup" ? "pickup" : "ship",
    };
  } catch {
    return defaultPrefs;
  }
}

export async function saveCheckoutPrefs(prefs: CheckoutPrefs) {
  await AsyncStorage.setItem(KEY, JSON.stringify(prefs)).catch(() => undefined);
}
