import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { brand, colombia } from "../lib/catalog";
import { colors, fonts, radii } from "../theme";

const LINEN = "#f5ead8";
const INK = "#120e0b";
const BRASS_DIM = "#8a6e52";
const KRAFT = "#9c704b";

/** Calm seal hold, then a slow crossfade into the shop. */
const SEAL_HOLD_MS = 1700;
const SEAL_FADE_MS = 820;
const NATIVE_HIDE_MS = 240;
const SKIP_AFTER_MS = 1200;

const SLIDES = [
  {
    kicker: "House favorite",
    title: "Colombia leads.",
    body: "Dried orange, berry, chocolate. The bag we pour first.",
    image: colombia.image,
  },
  {
    kicker: "The look",
    title: "From the highlands.",
    body: "Puerto Rico in the mark. Single-origin in the cup. Ships from the U.S.",
    image: brand.heroImage,
  },
  {
    kicker: "Home bar",
    title: "Ready to pour.",
    body: `${brand.promo} for 10% off. Origins, capsules, and house-mark gear.`,
    image: brand.ritualImage,
  },
] as const;

type Props = {
  onEnter: () => void;
  onReady?: () => void;
  firstLaunch: boolean;
  replayKey?: number;
};

function Splash({
  fading,
  onSkip,
  onReady,
}: {
  fading: boolean;
  onSkip: () => void;
  onReady?: () => void;
}) {
  const opacity = useRef(new Animated.Value(1)).current;
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (!fading) return;
    Animated.timing(opacity, {
      toValue: 0,
      duration: SEAL_FADE_MS,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [fading, opacity]);

  useEffect(() => {
    const ready = setTimeout(() => onReady?.(), NATIVE_HIDE_MS);
    const skip = setTimeout(() => setCanSkip(true), SKIP_AFTER_MS);
    return () => {
      clearTimeout(ready);
      clearTimeout(skip);
    };
  }, []);

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
      </Pressable>
    </Animated.View>
  );
}

function Onboard({ onDone }: { onDone: () => void }) {
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const short = height < 700;

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const next = Math.round(x / Math.max(width, 1));
    setIndex(Math.max(0, Math.min(SLIDES.length - 1, next)));
  };

  const go = (i: number) => {
    const next = Math.max(0, Math.min(SLIDES.length - 1, i));
    setIndex(next);
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
  };

  const slide = SLIDES[index];

  return (
    <SafeAreaView style={styles.onboard} edges={["top", "left", "right", "bottom"]}>
      <StatusBar style="dark" />
      <Pressable onPress={onDone} style={styles.skip} hitSlop={12} accessibilityLabel="Skip">
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        style={styles.pager}
        decelerationRate="fast"
      >
        {SLIDES.map((s) => (
          <View key={s.title} style={[styles.slide, { width }]}>
            <View style={[styles.photo, short && { flex: 0.9 }]}>
              <Image source={{ uri: s.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <Pressable
            key={s.title}
            onPress={() => go(i)}
            style={[styles.dot, i === index && styles.dotOn]}
            accessibilityLabel={`Slide ${i + 1}`}
          />
        ))}
      </View>

      <View style={styles.copy}>
        <Text style={styles.kicker}>{slide.kicker.toUpperCase()}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        {!short ? <Text style={styles.body}>{slide.body}</Text> : null}
      </View>

      <View style={styles.actions}>
        <Pressable onPress={onDone} style={styles.primary} accessibilityRole="button">
          <Text style={styles.primaryText}>Get started</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

/**
 * Kraft seal every launch (same crop as the native splash).
 * Hold, then fade only — no overlay beans, no tagline, no scale.
 * Returning launches keep this overlay mounted until the fade finishes
 * so enterShop does not tear it down mid-crossfade.
 */
export function WelcomeScreen({ onEnter, onReady, firstLaunch, replayKey = 0 }: Props) {
  const [splash, setSplash] = useState(true);
  const [splashGone, setSplashGone] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const enter = useRef(onEnter);
  enter.current = onEnter;

  useEffect(() => {
    setSplash(true);
    setSplashGone(false);
    setLeaving(false);
    const id = setTimeout(() => setSplash(false), SEAL_HOLD_MS);
    return () => clearTimeout(id);
  }, [replayKey]);

  useEffect(() => {
    if (splash) return;
    const id = setTimeout(() => {
      setSplashGone(true);
      if (!firstLaunch) enter.current();
    }, SEAL_FADE_MS);
    return () => clearTimeout(id);
  }, [splash, firstLaunch]);

  const finish = () => {
    setLeaving(true);
    setTimeout(onEnter, 280);
  };

  const showOnboard = firstLaunch && !leaving;
  const captureTaps = splash || showOnboard;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={captureTaps ? "auto" : "none"}>
      {showOnboard ? <Onboard onDone={finish} /> : null}
      {!splashGone ? <Splash fading={!splash} onSkip={() => setSplash(false)} onReady={onReady} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: KRAFT,
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
  onboard: {
    flex: 1,
    backgroundColor: LINEN,
  },
  skip: {
    position: "absolute",
    right: 8,
    top: 8,
    zIndex: 5,
    minHeight: 44,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  skipText: {
    color: LINEN,
    fontFamily: fonts.bodyMed,
    fontSize: 15,
  },
  pager: { flex: 1 },
  slide: { justifyContent: "flex-start" },
  photo: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#c4a484",
    minHeight: 220,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(18,14,11,0.18)",
  },
  dotOn: { backgroundColor: INK, width: 18 },
  copy: { paddingHorizontal: 28, alignItems: "center", paddingBottom: 8 },
  kicker: {
    color: BRASS_DIM,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 2.6,
  },
  title: {
    marginTop: 8,
    color: INK,
    fontFamily: fonts.bodyBold,
    fontSize: 28,
    letterSpacing: -0.4,
    textAlign: "center",
  },
  body: {
    marginTop: 8,
    color: BRASS_DIM,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 340,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    paddingTop: 8,
    gap: 4,
  },
  primary: {
    backgroundColor: INK,
    borderRadius: radii.pill,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    color: LINEN,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
});
