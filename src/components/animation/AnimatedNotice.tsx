import { ReactNode } from 'react';
import { StyleProp, TextStyle } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';

type Props = {
  children: ReactNode;
  /** Estilo del aviso (el mismo `notice` que ya usa cada pantalla). */
  style?: StyleProp<TextStyle>;
};

/**
 * Aviso de éxito ("Teléfono actualizado...") que baja con un pequeño rebote al
 * aparecer y se desvanece al quitarse. Renderízalo solo cuando haya mensaje:
 *   {notice && <AnimatedNotice style={styles.notice}>{notice}</AnimatedNotice>}
 */
export function AnimatedNotice({ children, style }: Props) {
  return (
    <Animated.Text
      entering={FadeInUp.springify().damping(14).stiffness(160)}
      exiting={FadeOutUp.duration(220)}
      style={style}
      accessibilityRole="alert"
    >
      {children}
    </Animated.Text>
  );
}
