import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
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
import { AccountScreen } from "./src/screens/AccountScreen";
import { ProductScreen } from "./src/screens/ProductScreen";
import { CheckoutScreen } from "./src/screens/CheckoutScreen";
import { CartProvider, useCart } from "./src/lib/cart";
import {
  loadWelcomeSeen,
  saveWelcomeSeen,
} from "./src/lib/welcomeStorage";
import { colors } from "./src/theme";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

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
  const [tab, setTab] = useState<TabId>("home");
  const [productId, setProductId] = useState<string | null>(null);
  const [checkout, setCheckout] = useState(false);

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

  const enterShop = async () => {
    await saveWelcomeSeen();
    setShowWelcome(false);
    setTab("home");
  };

  if (!fontsLoaded || !ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.brass} />
      </View>
    );
  }

  if (showWelcome) {
    return (
      <WelcomeScreen
        replayKey={welcomeReplayKey}
        onEnter={() => void enterShop()}
      />
    );
  }

  if (checkout) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
          <StatusBar style="light" />
          <CheckoutScreen
            onClose={() => setCheckout(false)}
            onDone={() => {
              setCheckout(false);
              setTab("shop");
            }}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (productId) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
          <StatusBar style="light" />
          <ProductScreen
            productId={productId}
            onBack={() => setProductId(null)}
            onGoCart={() => {
              setProductId(null);
              setTab("cart");
            }}
            onOpenProduct={(id) => setProductId(id)}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <StatusBar style="light" />
        <View style={styles.body}>
          {tab === "home" ? (
            <HomeScreen
              onOpenShop={() => setTab("shop")}
              onOpenProduct={(id) => setProductId(id)}
            />
          ) : null}
          {tab === "shop" ? (
            <ShopScreen onOpenProduct={(id) => setProductId(id)} />
          ) : null}
          {tab === "cart" ? (
            <CartScreen
              onOpenShop={() => setTab("shop")}
              onOpenProduct={(id) => setProductId(id)}
              onCheckout={() => setCheckout(true)}
            />
          ) : null}
          {tab === "account" ? (
            <AccountScreen
              onShowWelcome={() => {
                setWelcomeReplayKey((k) => k + 1);
                setShowWelcome(true);
              }}
            />
          ) : null}
        </View>
        <SafeAreaView edges={["bottom"]} style={styles.tabSafe}>
          <TabShell active={tab} onChange={setTab} cartCount={cart.count} />
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
  boot: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  body: {
    flex: 1,
  },
  tabSafe: {
    backgroundColor: colors.tabGlass,
  },
});
