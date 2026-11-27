import { ReactNode, useMemo } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';

type Props = {
  children: ReactNode;
  /** Posición en la cascada: cada número retrasa la entrada `stagger` ms más. */
  index?: number;
  /** Retraso base (ms) antes de empezar la cascada. */
  delay?: number;
  /** Pausa entre un elemento y el siguiente (ms). */
  stagger?: number;
  duration?: number;
  /** Cuántos px sube mientras aparece. */
  distance?: number;
  /** Escala inicial (1 = sin efecto de crecimiento). */
  scale?: number;
  /** Tope del retraso total (ms). Súbelo en secuencias largas, como la bienvenida. */
  maxDelay?: number;
  style?: StyleProp<ViewStyle>;
};

// Tope por defecto para que una lista larga no tarde segundos en terminar de aparecer
const MAX_DELAY = 700;

/**
 * Envuelve cualquier bloque y lo hace entrar con fade + subida + ligero
 * crecimiento. Usa `index` para escalonar varios (cascada). Solo anima cuando
 * el bloque se monta; si el usuario tiene activado "reducir movimiento" en el
 * sistema, Reanimated omite la animación por sí solo.
 *
 *   <Reveal index={0}><Header /></Reveal>
 *   <Reveal index={1}><Card /></Reveal>
 */
export function Reveal({
  children,
  index = 0,
  delay = 0,
  stagger = 80,
  duration = 380,
  distance = 22,
  scale = 0.97,
  maxDelay = MAX_DELAY,
  style,
}: Props) {
  const entering = useMemo(
    () =>
      new Keyframe({
        0: { opacity: 0, transform: [{ translateY: distance }, { scale }] },
        100: {
          opacity: 1,
          transform: [{ translateY: 0 }, { scale: 1 }],
          easing: Easing.out(Easing.cubic),
        },
      })
        .duration(duration)
        .delay(Math.min(delay + index * stagger, maxDelay)),
    [index, delay, stagger, duration, distance, scale, maxDelay],
  );

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}
