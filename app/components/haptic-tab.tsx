import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { TouchableOpacity } from "react-native";

export function HapticTab({
  children,
  onPress,
  accessibilityState,
  delayLongPress,
  disabled,
  onBlur,
  onFocus,
  onLongPress,
  onPressIn,
  onPressOut,
  ...rest
}: BottomTabBarButtonProps) {
  // Corrige props null para undefined
  const safeDelayLongPress =
    delayLongPress === null ? undefined : delayLongPress;
  const safeDisabled = disabled === null ? undefined : disabled;
  const safeOnBlur = onBlur === null ? undefined : onBlur;
  const safeOnFocus = onFocus === null ? undefined : onFocus;
  const safeOnLongPress = onLongPress === null ? undefined : onLongPress;
  const safeOnPressIn = onPressIn === null ? undefined : onPressIn;
  const safeOnPressOut = onPressOut === null ? undefined : onPressOut;
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityState={accessibilityState}
      delayLongPress={safeDelayLongPress}
      disabled={safeDisabled}
      onBlur={safeOnBlur}
      onFocus={safeOnFocus}
      onLongPress={safeOnLongPress}
      onPressIn={safeOnPressIn}
      onPressOut={safeOnPressOut}
    >
      {children}
    </TouchableOpacity>
  );
}

export default HapticTab; 