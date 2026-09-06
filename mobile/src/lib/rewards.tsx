import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { TIERS, WELCOME_STARS } from "./catalog";

const KEY = "casa.stars.v1";

type RewardsValue = {
  stars: number;
  lifetime: number;
  ready: boolean;
  grantWelcome: () => Promise<void>;
};

const Ctx = createContext<RewardsValue | null>(null);

export function RewardsProvider({ children }: { children: ReactNode }) {
  const [stars, setStars] = useState(0);
  const [lifetime, setLifetime] = useState(0);
  const [ready, setReady] = useState(false);
  const [welcomed, setWelcomed] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw) as { stars?: number; lifetime?: number; welcomed?: boolean };
          if (typeof parsed.stars === "number") setStars(parsed.stars);
          if (typeof parsed.lifetime === "number") setLifetime(parsed.lifetime);
          if (parsed.welcomed) setWelcomed(true);
        } catch {
          /* ignore */
        }
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    void AsyncStorage.setItem(
      KEY,
      JSON.stringify({ stars, lifetime, welcomed }),
    ).catch(() => undefined);
  }, [stars, lifetime, welcomed, ready]);

  const grantWelcome = useCallback(async () => {
    if (welcomed) return;
    setStars((n) => n + WELCOME_STARS);
    setLifetime((n) => n + WELCOME_STARS);
    setWelcomed(true);
  }, [welcomed]);

  return (
    <Ctx.Provider value={{ stars, lifetime, ready, grantWelcome }}>
      {children}
    </Ctx.Provider>
  );
}

export function useRewards() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useRewards outside RewardsProvider");
  return v;
}

export function currentTier(stars: number) {
  return [...TIERS].reverse().find((t) => stars >= t.min) ?? TIERS[0];
}

export function nextTier(stars: number) {
  return TIERS.find((t) => t.min > stars);
}
