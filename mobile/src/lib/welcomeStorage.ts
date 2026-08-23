import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "casa.welcome.seen.v2";

export async function loadWelcomeSeen(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === "1";
  } catch {
    return false;
  }
}

export async function saveWelcomeSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, "1");
  } catch {
    /* ignore */
  }
}

export async function clearWelcomeSeen(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
