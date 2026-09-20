import { useEffect, useState } from "react";
import { AccessibilityInfo, Platform } from "react-native";
import {
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";

/** Native UIGlassEffect — iOS 26+ / iOS 27 system chrome. */
export function canUseNativeLiquidGlass(): boolean {
  if (Platform.OS !== "ios") return false;
  try {
    return isGlassEffectAPIAvailable() && isLiquidGlassAvailable();
  } catch {
    return false;
  }
}

export function useChromeMaterial(): { native: boolean; reduce: boolean } {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    let live = true;
    const apply = (next: boolean) => {
      if (live) setReduce(next);
    };
    const probe = AccessibilityInfo.isReduceTransparencyEnabled;
    if (typeof probe !== "function") return;
    void probe.call(AccessibilityInfo).then(apply);
    const sub = AccessibilityInfo.addEventListener("reduceTransparencyChanged", apply);
    return () => {
      live = false;
      sub.remove();
    };
  }, []);

  return {
    native: !reduce && canUseNativeLiquidGlass(),
    reduce,
  };
}
