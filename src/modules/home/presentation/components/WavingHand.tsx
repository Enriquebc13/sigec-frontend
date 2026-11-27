import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// Posición de cada destello alrededor de la mano (en % del contenedor)
const SPARKLES = [
  { top: '4%', left: '10%', size: 16, delay: 900 },
  { top: '14%', left: '84%', size: 12, delay: 1150 },
  { top: '58%', left: '2%', size: 11, delay: 1400 },
  { top: '70%', left: '88%', size: 17, delay: 1000 },
  { top: '-4%', left: '56%', size: 10, delay: 1250 },
  { top: '88%', left: '30%', size: 12, delay: 1500 },
] as const;

function Sparkle({ top, left, size, delay }: (typeof SPARKLES)[number]) {
  const glow = useSharedValue(0);

  useEffect(() => {
    // 5 destellos (número impar) y se queda encendido suave: no parpadea sin fin
    glow.set(withDelay(delay, withRepeat(withTiming(1, { duration: 650 }), 5, true)));
  }, [glow, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.15 + glow.value * 0.75,
    transform: [{ scale: 0.6 + glow.value * 0.5 }],
  }));

  return (
    <Animated.Text style={[styles.sparkle, { top, left, fontSize: size }, style]}>✦</Animated.Text>
  );
}

/**
 * Mano 👋 que entra con rebote, saluda moviéndose a los lados y se queda quieta.
 * Va sobre un halo morado que pulsa unas pocas veces. Todo con Reanimated, sin
 * archivos de animación externos.
 */
export function WavingHand() {
  const pop = useSharedValue(0);
  const wave = useSharedValue(0);
  const halo = useSharedValue(0);

  useEffect(() => {
    pop.set(withSpring(1, { damping: 8, stiffness: 120 }));

    // Saludo: va y viene unas veces y termina en reposo
    wave.set(
      withDelay(
        650,
        withSequence(
          withTiming(1, { duration: 160 }),
          withTiming(-0.6, { duration: 200 }),
          withTiming(1, { duration: 200 }),
          withTiming(-0.6, { duration: 200 }),
          withTiming(1, { duration: 200 }),
          withTiming(0, { duration: 240 }),
        ),
      ),
    );

    // Halo: 3 pulsos suaves y se queda fijo
    halo.set(withDelay(300, withRepeat(withTiming(1, { duration: 900 }), 4, true)));
  }, [pop, wave, halo]);

  const handStyle = useAnimatedStyle(() => ({
    opacity: pop.value,
    transform: [{ scale: pop.value }, { rotate: `${wave.value * 20}deg` }],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + halo.value * 0.35,
    transform: [{ scale: 0.92 + halo.value * 0.16 }],
  }));

  return (
    <View style={styles.wrap} accessible accessibilityLabel="Mano saludando" accessibilityRole="image">
      <Animated.View style={[styles.halo, haloStyle]} />
      {SPARKLES.map((s, i) => (
        <Sparkle key={i} {...s} />
      ))}
      <Animated.View style={[styles.hand, handStyle]}>
        <Text style={styles.emoji}>👋</Text>
      </Animated.View>
    </View>
  );
}

const SIZE = 150;

const styles = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: 'rgba(139,92,246,0.38)',
  },
  // El giro es desde la muñeca (abajo a la derecha), como un saludo real
  hand: { transformOrigin: '70% 85%' },
  emoji: { fontSize: 78 },
  sparkle: { position: 'absolute', color: '#D7C9FF' },
});
