import { useRef, type ReactNode } from "react";
import {
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import { animatePressIn, animatePressOut, createPressScale } from "../lib/motion";

type Props = Omit<PressableProps, "style"> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  haptic?: boolean;
};

export function PressableScale({
  children,
  style,
  haptic = true,
  onPressIn,
  onPressOut,
  onPress,
  ...rest
}: Props) {
  const scale = useRef(createPressScale()).current;

  return (
    <Pressable
      {...rest}
      style={style}
      onPressIn={(e) => {
        animatePressIn(scale);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        animatePressOut(scale);
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress?.(e);
      }}
    >
      <Animated.View style={{ transform: [{ scale }], alignSelf: "stretch" }}>{children}</Animated.View>
    </Pressable>
  );
}
