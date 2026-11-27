import { useEffect } from 'react';
import { DimensionValue, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/** Bloque gris que "respira"; es la pieza base de las pantallas de carga. */
export function Skeleton({ width = '100%', height = 14, radius = 8, style }: SkeletonProps) {
  const pulse = useSharedValue(0.35);

  useEffect(() => {
    pulse.set(
      withRepeat(withTiming(0.85, { duration: 850, easing: Easing.inOut(Easing.quad) }), -1, true),
    );
    // Al desmontarse (llegaron los datos) se detiene para no gastar batería
    return () => cancelAnimation(pulse);
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius, backgroundColor: 'rgba(255,255,255,0.16)' }, animatedStyle, style]}
    />
  );
}

export type SkeletonVariant = 'property' | 'request' | 'row';

/** Tarjeta de carga con la silueta de una tarjeta real. */
export function SkeletonCard({ variant = 'request' }: { variant?: SkeletonVariant }) {
  if (variant === 'property') {
    return (
      <View style={styles.card}>
        <Skeleton height={150} radius={14} />
        <View style={styles.rowGap}>
          <Skeleton width={44} height={44} radius={12} />
          <View style={styles.fill}>
            <Skeleton width="65%" height={16} />
            <Skeleton width="35%" height={12} />
          </View>
        </View>
        <Skeleton height={12} />
        <Skeleton width="80%" height={12} />
        <Skeleton height={42} radius={12} />
      </View>
    );
  }
  if (variant === 'row') {
    return (
      <View style={[styles.card, styles.rowGap]}>
        <Skeleton width={46} height={46} radius={23} />
        <View style={styles.fill}>
          <Skeleton width="55%" height={15} />
          <Skeleton width="80%" height={12} />
        </View>
      </View>
    );
  }
  return (
    <View style={styles.card}>
      <View style={styles.rowGap}>
        <View style={styles.fill}>
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} />
        </View>
        <Skeleton width={78} height={26} radius={13} />
      </View>
      <Skeleton height={12} />
      <Skeleton width="70%" height={12} />
      <Skeleton height={40} radius={12} />
    </View>
  );
}

/** Varias tarjetas de carga seguidas. */
export function SkeletonList({ count = 3, variant = 'request' }: { count?: number; variant?: SkeletonVariant }) {
  return (
    <View accessibilityLabel="Cargando" accessibilityRole="progressbar">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} variant={variant} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 15,
    marginBottom: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  rowGap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fill: { flex: 1, gap: 8 },
});
