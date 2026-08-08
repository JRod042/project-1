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
import { TodayScreen } from "./src/screens/TodayScreen";
import { BookScreen } from "./src/screens/BookScreen";
import { FloorScreen } from "./src/screens/FloorScreen";
import { HouseScreen } from "./src/screens/HouseScreen";
import { MoreScreen } from "./src/screens/MoreScreen";
import {
  loadWelcomeSeen,
  saveWelcomeSeen,
} from "./src/lib/welcomeStorage";
import { colors } from "./src/theme";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function App() {
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
  const [tab, setTab] = useState<TabId>("today");

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

  const enterHouse = async () => {
    await saveWelcomeSeen();
    setShowWelcome(false);
    setTab("today");
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
        onEnter={() => void enterHouse()}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <StatusBar style="light" />
        <View style={styles.body}>
          {tab === "today" ? (
            <TodayScreen onNewReservation={() => setTab("book")} />
          ) : null}
          {tab === "book" ? <BookScreen /> : null}
          {tab === "floor" ? <FloorScreen /> : null}
          {tab === "house" ? <HouseScreen /> : null}
          {tab === "more" ? (
            <MoreScreen
              onShowWelcome={() => {
                setWelcomeReplayKey((k) => k + 1);
                setShowWelcome(true);
              }}
            />
          ) : null}
        </View>
        <SafeAreaView edges={["bottom"]} style={styles.tabSafe}>
          <TabShell active={tab} onChange={setTab} />
        </SafeAreaView>
      </SafeAreaView>
    </SafeAreaProvider>
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
    backgroundColor: colors.bgElevated,
  },
});
