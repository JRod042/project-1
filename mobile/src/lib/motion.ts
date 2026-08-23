import { Animated, Easing } from "react-native";
import { spring } from "../theme";

export function createPressScale(initial = 1) {
  return new Animated.Value(initial);
}

export function animatePressIn(scale: Animated.Value) {
  Animated.spring(scale, {
    toValue: 0.96,
    useNativeDriver: true,
    ...spring.press,
  }).start();
}

export function animatePressOut(scale: Animated.Value) {
  Animated.spring(scale, {
    toValue: 1,
    useNativeDriver: true,
    ...spring.press,
  }).start();
}

export function fadeSlideIn(
  opacity: Animated.Value,
  translateY: Animated.Value,
  delay = 0
) {
  opacity.setValue(0);
  translateY.setValue(14);
  Animated.parallel([
    Animated.timing(opacity, {
      toValue: 1,
      duration: 380,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
    Animated.spring(translateY, {
      toValue: 0,
      delay,
      useNativeDriver: true,
      ...spring.soft,
    }),
  ]).start();
}

export function runTabIndicator(
  x: Animated.Value,
  toValue: number
) {
  Animated.spring(x, {
    toValue,
    useNativeDriver: true,
    ...spring.snappy,
  }).start();
}
