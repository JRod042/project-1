import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFonts,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from "@expo-google-fonts/fraunces";
import {
  SourceSans3_400Regular,
  SourceSans3_600SemiBold,
  SourceSans3_700Bold,
} from "@expo-google-fonts/source-sans-3";
import * as SplashScreen from "expo-splash-screen";
import { WelcomeScreen } from "./src/components/WelcomeScreen";
import { TabShell, type TabId } from "./src/components/TabShell";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ShopScreen } from "./src/screens/ShopScreen";
import { CartScreen } from "./src/screens/CartScreen";
import { ProductScreen } from "./src/screens/ProductScreen";
import { RitualScreen } from "./src/screens/RitualScreen";
import { StoryScreen } from "./src/screens/StoryScreen";
import { CartProvider, useCart } from "./src/lib/cart";
import {
  clearWelcomeSeen,
  loadWelcomeSeen,
  saveWelcomeSeen,
} from "./src/lib/welcomeStorage";
import { PressableScale } from "./src/components/PressableScale";
import { GlassPanel } from "./src/components/GlassPanel";
import { colors, fonts, radii } from "./src/theme";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

type Screen =
  | { kind: "tab"; tab: TabId }
  | { kind: "product"; productId: string; back: TabId }
  | { kind: "bag"; back: TabId };

function ShopApp() {
  const cart = useCart();
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    SourceSans3_400Regular,
    SourceSans3_600SemiBold,
    SourceSans3_700Bold,
  });

  const [ready, setReady] = useState(false);
  const [welcomeSeen, setWelcomeSeen] = useState(false);
  const [gateOn, setGateOn] = useState(true);
  const [welcomeReplayKey, setWelcomeReplayKey] = useState(0);
  const [screen, setScreen] = useState<Screen>({ kind: "tab", tab: "home" });
  const lastCount = useRef(cart.count);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    loadWelcomeSeen()
      .then((seen) => {
        setWelcomeSeen(seen);
        setGateOn(true);
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (fontsLoaded && ready) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded, ready]);

  useEffect(() => {
    if (cart.count > lastCount.current) {
      setPop(true);
      const id = setTimeout(() => setPop(false), 420);
      lastCount.current = cart.count;
      return () => clearTimeout(id);
    }
    lastCount.current = cart.count;
  }, [cart.count]);

  const enterShop = async () => {
    await saveWelcomeSeen();
    setWelcomeSeen(true);
    setGateOn(false);
    setScreen({ kind: "tab", tab: "home" });
  };

  const tab: TabId = screen.kind === "tab" ? screen.tab : screen.back;
  const openProduct = (id: string) =>
    setScreen({ kind: "product", productId: id, back: tab });
  const openBag = () => setScreen({ kind: "bag", back: tab });
  const openTab = (next: TabId) => setScreen({ kind: "tab", tab: next });
  const onBag = screen.kind === "bag";
  const onProduct = screen.kind === "product";
  const hideTabs = onBag || onProduct;
  const firstLaunch = !welcomeSeen;

  if (!fontsLoaded || !ready) {
    return <View style={styles.boot} />;
  }

  const showShop = welcomeSeen || !gateOn;

  return (
    <View style={styles.safe}>
        {showShop ? (
          <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />
            <View style={styles.storeBar}>
              {onProduct ? (
                <PressableScale
                  onPress={() => setScreen({ kind: "tab", tab: screen.back })}
                  accessibilityLabel="Back"
                >
                  <GlassPanel style={styles.backOrb}>
                    <Text style={styles.backGlyph}>‹</Text>
                  </GlassPanel>
                </PressableScale>
              ) : onBag ? (
                <PressableScale
                  onPress={() => setScreen({ kind: "tab", tab: screen.back })}
                  accessibilityLabel="Back"
                >
                  <GlassPanel style={styles.backOrb}>
                    <Text style={styles.backGlyph}>‹</Text>
                  </GlassPanel>
                </PressableScale>
              ) : (
                <Text style={styles.barMark}>CASA RÚSTICO</Text>
              )}
              <View style={styles.bagGhost} />
            </View>

            <View style={styles.body}>
              {screen.kind === "product" ? (
                <ProductScreen
                  key={screen.productId}
                  productId={screen.productId}
                  onBack={() => setScreen({ kind: "tab", tab: screen.back })}
                  onOpenProduct={openProduct}
                />
              ) : screen.kind === "bag" ? (
                <CartScreen onOpenProduct={openProduct} />
              ) : tab === "home" ? (
                <HomeScreen onOpenProduct={openProduct} onOpenTab={openTab} />
              ) : tab === "coffee" ? (
                <ShopScreen onOpenProduct={openProduct} />
              ) : tab === "ritual" ? (
                <RitualScreen onOpenProduct={openProduct} />
              ) : (
                <StoryScreen
                  onOpenProduct={openProduct}
                  onReplayWelcome={() => {
                    void clearWelcomeSeen();
                    setWelcomeSeen(false);
                    setGateOn(true);
                    setWelcomeReplayKey((k) => k + 1);
                  }}
                />
              )}
            </View>

            {cart.toast ? (
              <View
                style={[styles.toast, { bottom: hideTabs ? 24 : 150 + insets.bottom }]}
                pointerEvents="none"
              >
                <Text style={styles.toastText}>{cart.toast}</Text>
              </View>
            ) : null}

            {hideTabs ? null : (
              <View
                pointerEvents="box-none"
                style={[styles.dockWrap, { paddingBottom: Math.max(insets.bottom, 8) }]}
              >
                {cart.count > 0 ? (
                  <PressableScale onPress={openBag} style={styles.review}>
                    <Text style={styles.reviewTitle}>Review bag</Text>
                    <Text style={styles.reviewSub}>
                      {cart.count} {cart.count === 1 ? "item" : "items"}
                    </Text>
                  </PressableScale>
                ) : null}
                <View style={styles.dockRow}>
                  <TabShell active={tab} onChange={openTab} />
                  <PressableScale
                    onPress={openBag}
                    style={[styles.bagOrbHit, pop && styles.bagPop]}
                    accessibilityLabel={`Bag, ${cart.count} items`}
                  >
                    <GlassPanel style={styles.bagOrb}>
                      <View style={styles.bagGlyph}>
                        <View style={styles.bagHandle} />
                        <View style={styles.bagBody} />
                      </View>
                      {cart.count > 0 ? (
                        <View style={styles.fabCount}>
                          <Text style={styles.fabCountText}>
                            {cart.count > 9 ? "9+" : cart.count}
                          </Text>
                        </View>
                      ) : null}
                    </GlassPanel>
                  </PressableScale>
                </View>
              </View>
            )}
          </SafeAreaView>
        ) : (
          <View style={styles.boot} />
        )}

        {gateOn ? (
          <WelcomeScreen
            replayKey={welcomeReplayKey}
            firstLaunch={firstLaunch}
            onEnter={() => void enterShop()}
          />
        ) : null}
      </View>
  );
}

export default function App() {
  return (
    <CartProvider>
      <SafeAreaProvider>
        <ShopApp />
      </SafeAreaProvider>
    </CartProvider>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, backgroundColor: "#f5ead8" },
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1 },
  storeBar: {
    height: 52,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  barMark: {
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 3.2,
    marginLeft: 8,
  },
  backOrb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#120e0b",
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  backGlyph: {
    color: colors.ink,
    fontFamily: fonts.bodyMed,
    fontSize: 28,
    lineHeight: 32,
    marginTop: -2,
    marginLeft: -1,
  },
  bagGhost: { width: 44, height: 44 },
  bagPop: { transform: [{ scale: 1.08 }] },
  bagGlyph: { width: 16, height: 18, alignItems: "center" },
  bagHandle: {
    width: 8,
    height: 5,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: colors.ink,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  bagBody: {
    width: 14,
    height: 12,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 2,
    marginTop: -1,
  },
  fabCount: {
    position: "absolute",
    top: 8,
    right: 8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  fabCountText: { color: colors.linen, fontFamily: fonts.bodyBold, fontSize: 9 },
  dockWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    gap: 10,
  },
  dockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bagOrbHit: {
    width: 62,
    height: 62,
  },
  bagOrb: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#120e0b",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
  },
  review: {
    backgroundColor: "rgba(18,14,11,0.88)",
    borderRadius: radii.pill,
    minHeight: 52,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reviewTitle: { color: colors.linen, fontFamily: fonts.bodyBold, fontSize: 16 },
  reviewSub: { color: colors.linen, fontFamily: fonts.body, fontSize: 13, opacity: 0.8 },
  toast: {
    position: "absolute",
    left: 24,
    right: 24,
    backgroundColor: colors.ink,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    zIndex: 30,
  },
  toastText: { color: colors.linen, fontFamily: fonts.bodyBold, fontSize: 14 },
});
