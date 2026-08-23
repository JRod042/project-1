import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
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
import { loadWelcomeSeen, saveWelcomeSeen } from "./src/lib/welcomeStorage";
import { PressableScale } from "./src/components/PressableScale";
import { colors, fonts } from "./src/theme";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

type Screen =
  | { kind: "tab"; tab: TabId }
  | { kind: "product"; productId: string; back: TabId }
  | { kind: "bag"; back: TabId };

function ShopApp() {
  const cart = useCart();
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    SourceSans3_400Regular,
    SourceSans3_600SemiBold,
    SourceSans3_700Bold,
  });

  const [ready, setReady] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [welcomeReplayKey, setWelcomeReplayKey] = useState(0);
  const [screen, setScreen] = useState<Screen>({ kind: "tab", tab: "home" });
  const lastCount = useRef(cart.count);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    loadWelcomeSeen().then((seen) => {
      setShowWelcome(!seen);
      setReady(true);
    });
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
    setShowWelcome(false);
    setScreen({ kind: "tab", tab: "home" });
  };

  const tab: TabId = screen.kind === "tab" ? screen.tab : screen.back;
  const openProduct = (id: string) =>
    setScreen({ kind: "product", productId: id, back: tab });
  const openBag = () => setScreen({ kind: "bag", back: tab });
  const onBag = screen.kind === "bag";

  if (!fontsLoaded || !ready) {
    return <View style={styles.boot} />;
  }

  if (showWelcome) {
    return (
      <WelcomeScreen replayKey={welcomeReplayKey} onEnter={() => void enterShop()} />
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <StatusBar style="light" />
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
            <HomeScreen
              onOpenShop={() => setScreen({ kind: "tab", tab: "coffee" })}
              onOpenProduct={openProduct}
              onOpenStory={() => setScreen({ kind: "tab", tab: "story" })}
            />
          ) : tab === "coffee" ? (
            <ShopScreen onOpenProduct={openProduct} />
          ) : tab === "ritual" ? (
            <RitualScreen onOpenProduct={openProduct} />
          ) : (
            <StoryScreen
              onOpenProduct={openProduct}
              onReplayWelcome={() => {
                setWelcomeReplayKey((k) => k + 1);
                setShowWelcome(true);
              }}
            />
          )}
        </View>

        {!onBag ? (
          <PressableScale
            onPress={openBag}
            style={[styles.fab, pop && styles.fabPop]}
            accessibilityLabel={`Bag, ${cart.count} items`}
          >
            <Text style={styles.fabIcon}>Bag</Text>
            {cart.count > 0 ? (
              <View style={styles.fabCount}>
                <Text style={styles.fabCountText}>{cart.count > 9 ? "9+" : cart.count}</Text>
              </View>
            ) : null}
          </PressableScale>
        ) : null}

        {cart.toast ? (
          <View style={styles.toast} pointerEvents="none">
            <Text style={styles.toastText}>{cart.toast}</Text>
          </View>
        ) : null}

        <SafeAreaView edges={["bottom"]} style={styles.tabSafe}>
          <TabShell
            active={tab}
            onChange={(next) => setScreen({ kind: "tab", tab: next })}
          />
        </SafeAreaView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <CartProvider>
      <ShopApp />
    </CartProvider>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1 },
  tabSafe: { backgroundColor: colors.tabGlass },
  fab: {
    position: "absolute",
    top: 10,
    right: 16,
    minWidth: 52,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.lineBright,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    zIndex: 20,
  },
  fabPop: { transform: [{ scale: 1.06 }] },
  fabIcon: {
    color: colors.linen,
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    letterSpacing: 0.4,
  },
  fabCount: {
    position: "absolute",
    top: -6,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.brass,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  fabCountText: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 10 },
  toast: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 88,
    backgroundColor: colors.linen,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    zIndex: 30,
  },
  toastText: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 14 },
});
