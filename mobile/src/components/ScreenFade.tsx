import { useEffect, useRef, type ReactNode } from "react";
import { Animated, StyleSheet } from "react-native";
import { fadeSlideIn } from "../lib/motion";

export function ScreenFade({ children }: { children: ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    fadeSlideIn(opacity, y);
  }, [opacity, y]);

  return (
    <Animated.View
      style={[styles.root, { opacity, transform: [{ translateY: y }] }]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
