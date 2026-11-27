import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** Escala al presionar (1 = sin cambio). */
  pressedScale?: number;
};

/**
 * Pressable que se encoge un poco y baja su opacidad mientras se mantiene
 * presionado. Reemplaza a TouchableOpacity/Pressable en tarjetas y botones.
 */
export function PressableScale({
  style,
  pressedScale = 0.97,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - (1 - pressedScale) * pressed.value }],
    opacity: 1 - 0.15 * pressed.value,
  }));

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        pressed.set(withTiming(1, { duration: 90 }));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        pressed.set(withTiming(0, { duration: 160 }));
        onPressOut?.(e);
      }}
      style={[style, animatedStyle]}
    />
  );
}
