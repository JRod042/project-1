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
const BRASS = "#c4a484";
const BRASS_DIM = "#8a6e52";

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
    Animated.timing(opacity, {
      toValue: fading ? 0 : 1,
      duration: fading ? 420 : 0,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fading, opacity]);

  useEffect(() => {
    const ready = setTimeout(() => onReady?.(), 280);
    const skip = setTimeout(() => setCanSkip(true), 1000);
    return () => {
      clearTimeout(ready);
      clearTimeout(skip);
    };
    // Native splash hides once; skip is delayed so the kraft seal is seen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <View style={styles.splashLockup}>
          <Image
            source={require("../../assets/splash-icon.png")}
            style={styles.splashSeal}
            resizeMode="cover"
          />
          <Text style={styles.splashBrand}>CASA RÚSTICO</Text>
          <Text style={styles.splashTitle}>Mountain mornings.</Text>
          <Text style={styles.splashGo}>The culture of the cup.</Text>
        </View>
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
 * Kraft splash every launch (tap to skip). First launch: onboard after splash.
 * Returning: splash, then shop. Native splash stays up until this paints.
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
    const id = setTimeout(() => setSplash(false), 2200);
    return () => clearTimeout(id);
  }, [replayKey]);

  useEffect(() => {
    if (splash) return;
    if (!firstLaunch) {
      const id = setTimeout(() => enter.current(), 400);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setSplashGone(true), 400);
    return () => clearTimeout(id);
  }, [splash, firstLaunch]);

  const finish = () => {
    setLeaving(true);
    setTimeout(onEnter, 280);
  };

  const showOnboard = firstLaunch && !leaving;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={splashGone && !showOnboard ? "none" : "auto"}>
      {showOnboard ? <Onboard onDone={finish} /> : null}
      {!splashGone ? <Splash fading={!splash} onSkip={() => setSplash(false)} onReady={onReady} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#9c704b",
    zIndex: 20,
  },
  splashHit: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  splashLockup: {
    alignItems: "center",
    gap: 18,
  },
  splashSeal: {
    width: 220,
    height: 220,
    borderRadius: 48,
  },
  splashBrand: {
    color: LINEN,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 5.6,
    marginRight: -5.6,
  },
  splashTitle: {
    color: LINEN,
    fontFamily: fonts.display,
    fontSize: 28,
    letterSpacing: -0.4,
    textAlign: "center",
    marginTop: -4,
  },
  splashGo: {
    color: "rgba(245,234,216,0.78)",
    fontFamily: fonts.body,
    fontSize: 14,
    marginTop: -8,
    textAlign: "center",
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
  secondary: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    color: BRASS_DIM,
    fontFamily: fonts.bodyMed,
    fontSize: 14,
  },
});
