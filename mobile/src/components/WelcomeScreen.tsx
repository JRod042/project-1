import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts, radii } from "../theme";

/** Escape-format Hallow hold: seal + three dots, then one cream CTA. */
const SEAL_HOLD_MS = 2200;
const SEAL_FADE_MS = 720;
const NATIVE_HIDE_MS = 240;
const SKIP_AFTER_MS = 1100;
const INTERACT_MS = 1400;

type Props = {
  onEnter: () => void;
  onReady?: () => void;
  firstLaunch: boolean;
  replayKey?: number;
};

function PulseDot({ delay, reduced }: { delay: number; reduced: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(scale, {
          toValue: 1.45,
          duration: 420,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 420,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(280),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay, reduced, scale]);
  return <Animated.View style={[styles.dot, { transform: [{ scale }] }]} />;
}

function Splash({
  fading,
  onSkip,
  onReady,
  reduced,
}: {
  fading: boolean;
  onSkip: () => void;
  onReady?: () => void;
  reduced: boolean;
}) {
  const opacity = useRef(new Animated.Value(1)).current;
  const [canSkip, setCanSkip] = useState(reduced);

  useEffect(() => {
    if (!fading) return;
    Animated.timing(opacity, {
      toValue: 0,
      duration: reduced ? 120 : SEAL_FADE_MS,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [fading, opacity, reduced]);

  useEffect(() => {
    const ready = setTimeout(() => onReady?.(), NATIVE_HIDE_MS);
    const skip = setTimeout(() => setCanSkip(true), reduced ? 80 : SKIP_AFTER_MS);
    return () => {
      clearTimeout(ready);
      clearTimeout(skip);
    };
  }, [onReady, reduced]);

  return (
    <Animated.View
      pointerEvents={fading ? "none" : "auto"}
      style={[styles.splash, { opacity }]}
    >
      <StatusBar style="light" />
      <Pressable
        style={styles.splashHit}
        onPress={() => {
          if (canSkip) onSkip();
        }}
        accessibilityLabel="Continue"
      >
        <Image
          source={require("../../assets/splash-icon.png")}
          style={styles.splashSeal}
          resizeMode="contain"
        />
        <View style={styles.dots}>
          <PulseDot delay={0} reduced={reduced} />
          <PulseDot delay={160} reduced={reduced} />
          <PulseDot delay={300} reduced={reduced} />
        </View>
        <Text style={styles.splashWord}>Casa Rústico</Text>
      </Pressable>
    </Animated.View>
  );
}

function EnterHouse({ onDone, reduced }: { onDone: () => void; reduced: boolean }) {
  const rise = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  const [ready, setReady] = useState(reduced);

  useEffect(() => {
    if (reduced) return;
    Animated.timing(rise, {
      toValue: 1,
      duration: 480,
      delay: 80,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    const id = setTimeout(() => setReady(true), INTERACT_MS);
    return () => clearTimeout(id);
  }, [reduced, rise]);

  return (
    <SafeAreaView style={styles.enter} edges={["top", "left", "right", "bottom"]}>
      <StatusBar style="dark" />
      <View pointerEvents="none" style={styles.mistFar} />
      <View pointerEvents="none" style={styles.mistNear} />
      <Animated.View
        style={[
          styles.enterCopy,
          {
            opacity: rise,
            transform: [
              {
                translateY: rise.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.kicker}>CASA RÚSTICO</Text>
        <Text style={styles.title}>Colombia{"\n"}leads.</Text>
        <Text style={styles.body}>
          Single-origin bags. The cup first. Checkout stays here.
        </Text>
      </Animated.View>
      <Animated.View style={[styles.actions, { opacity: rise }]}>
        <Pressable
          onPress={onDone}
          disabled={!ready}
          style={[styles.primary, !ready && styles.primaryOff]}
          accessibilityRole="button"
          accessibilityLabel="Enter the shop"
        >
          <Text style={styles.primaryText}>Enter the shop</Text>
        </Pressable>
        <Text style={styles.house}>From the highlands</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

/**
 * Kraft seal every launch (same crop as the native splash).
 * Escape-format: three quiet dots, then one cream CTA on first launch.
 * No overlay beans, no Safari, no carousel.
 */
export function WelcomeScreen({ onEnter, onReady, firstLaunch, replayKey = 0 }: Props) {
  const [splash, setSplash] = useState(true);
  const [splashGone, setSplashGone] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [reduced, setReduced] = useState(false);
  const enter = useRef(onEnter);
  enter.current = onEnter;

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (alive) setReduced(!!v);
    });
    const sub = AccessibilityInfo.addEventListener?.("reduceMotionChanged", setReduced);
    return () => {
      alive = false;
      sub?.remove?.();
    };
  }, []);

  useEffect(() => {
    setSplash(true);
    setSplashGone(false);
    setLeaving(false);
    const hold = reduced ? 200 : SEAL_HOLD_MS;
    const id = setTimeout(() => setSplash(false), hold);
    return () => clearTimeout(id);
  }, [replayKey, reduced]);

  useEffect(() => {
    if (splash) return;
    const fade = reduced ? 80 : SEAL_FADE_MS;
    const id = setTimeout(() => {
      setSplashGone(true);
      if (!firstLaunch) enter.current();
    }, fade);
    return () => clearTimeout(id);
  }, [splash, firstLaunch, reduced]);

  const finish = () => {
    setLeaving(true);
    setTimeout(onEnter, 220);
  };

  const showEnter = firstLaunch && !leaving;
  const captureTaps = splash || showEnter;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={captureTaps ? "auto" : "none"}>
      {showEnter ? <EnterHouse onDone={finish} reduced={reduced} /> : null}
      {!splashGone ? (
        <Splash
          fading={!splash}
          onSkip={() => setSplash(false)}
          onReady={onReady}
          reduced={reduced}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.kraftSplash,
    zIndex: 20,
  },
  splashHit: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  splashSeal: {
    width: 220,
    height: 220,
  },
  dots: {
    flexDirection: "row",
    gap: 12,
    marginTop: 28,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFF8F0",
  },
  splashWord: {
    marginTop: 18,
    color: "rgba(247,243,236,0.78)",
    fontFamily: fonts.body,
    fontSize: 15,
    letterSpacing: 1.2,
  },
  enter: {
    flex: 1,
    backgroundColor: colors.linen,
  },
  mistFar: {
    position: "absolute",
    top: 48,
    left: -40,
    right: 40,
    height: 56,
    borderRadius: 999,
    backgroundColor: colors.paper,
    opacity: 0.45,
  },
  mistNear: {
    position: "absolute",
    top: 110,
    left: 20,
    right: -30,
    height: 36,
    borderRadius: 999,
    backgroundColor: colors.paper,
    opacity: 0.28,
  },
  enterCopy: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 72,
  },
  kicker: {
    color: colors.kraftDeep,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 2.8,
  },
  title: {
    marginTop: 12,
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -0.8,
  },
  body: {
    marginTop: 14,
    color: colors.brass,
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 24,
    maxWidth: 320,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    gap: 14,
    alignItems: "center",
  },
  primary: {
    alignSelf: "stretch",
    backgroundColor: colors.kraft,
    borderRadius: 16,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryOff: { opacity: 0.55 },
  primaryText: {
    color: colors.linen,
    fontFamily: fonts.bodyBold,
    fontSize: 17,
  },
  house: {
    color: colors.linenMuted,
    fontFamily: fonts.body,
    fontSize: 14,
  },
});
