
import { Reveal } from '@/components/animation/Reveal';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const NATIVE_SPLASH_COLOR = '#5E35B1';
const LOGO_WIDTH = 160;
const LOGO_RATIO = 1096 / 1080;
const HALO = 260;

type Props = {
  onReady?: () => void;
};

export function AnimatedSplash({ onReady }: Props) {
  const gradient = useSharedValue(0);
  const breathe = useSharedValue(0);
  const float = useSharedValue(0);
  const shine = useSharedValue(0);

  useEffect(() => {
    gradient.value = withTiming(1, { duration: 1000 });

    breathe.value = withRepeat(
      withTiming(1, {
        duration: 1800,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );

    float.value = withRepeat(
      withTiming(1, {
        duration: 2400,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );

    shine.value = withRepeat(
      withTiming(1, {
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [gradient, breathe, float, shine]);

  const gradientStyle = useAnimatedStyle(() => ({
    opacity: gradient.value,
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.20 + breathe.value * 0.22,
    transform: [{ scale: 0.85 + breathe.value * 0.18 }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: 1 + breathe.value * 0.025 },
      { translateY: -float.value * 7 },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.12 + shine.value * 0.18,
    transform: [{ scale: 0.9 + shine.value * 0.12 }],
  }));

  return (
    <View style={styles.container} onLayout={onReady}>
      <StatusBar style="light" />

      {/* Fondo degradado */}
      <Animated.View
        style={[StyleSheet.absoluteFill, gradientStyle]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={['#5E35B1', '#28134D', '#10091D', '#000000']}
          locations={[0, 0.38, 0.72, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Luces decorativas */}
      <Animated.View style={[styles.topGlow, glowStyle]} />
      <View style={styles.bottomGlow} />

      {/* Contenido principal */}
      <View style={styles.content}>
        <View style={styles.brandContainer}>
          {/* Iluminación detrás del logo */}
          <Animated.View style={[styles.halo, haloStyle]} />

          <Animated.View style={[styles.logoContainer, logoStyle]}>
            <Image
              source={require('@/assets/images/Logo SIGEC_.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Logo de SIGEC"
            />
          </Animated.View>
        </View>

        {/* Identidad de la aplicación */}
        <View style={styles.textBlock} pointerEvents="none">
          <Reveal delay={300}>
            <Text style={styles.title}>SIGEC</Text>
          </Reveal>

          <Reveal delay={450}>
            <View style={styles.decorativeLine} />
          </Reveal>

          <Reveal delay={550}>
            <Text style={styles.subtitle}>
              Sistema Integral de Gestión{'\n'}
              de Espacios Comerciales
            </Text>
          </Reveal>

          <Reveal delay={700}>
            <Text style={styles.slogan}>
              ORDEN QUE GENERA VALOR
            </Text>
          </Reveal>
        </View>
      </View>

      {/* Indicador de carga */}
      <Reveal delay={850} style={styles.loader}>
        <ActivityIndicator size="small" color="#D7C9FF" />
        <Text style={styles.loadingText}>Preparando tu experiencia...</Text>
      </Reveal>

      <Text style={styles.version}>SIGEC · Tu espacio, en orden</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NATIVE_SPLASH_COLOR,
    overflow: 'hidden',
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 45,
  },

  brandContainer: {
    width: HALO,
    height: HALO,
    alignItems: 'center',
    justifyContent: 'center',
  },

  halo: {
    position: 'absolute',
    width: HALO,
    height: HALO,
    borderRadius: HALO / 2,
    backgroundColor: '#8B5CF6',
  },

  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: LOGO_WIDTH,
    height: LOGO_WIDTH / LOGO_RATIO,
  },

  textBlock: {
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 10,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 8,
    textAlign: 'center',
  },

  decorativeLine: {
    width: 48,
    height: 3,
    borderRadius: 5,
    backgroundColor: '#B99AFF',
    marginTop: 13,
    marginBottom: 15,
  },

  subtitle: {
    color: '#E5DDFB',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 0.3,
  },

  slogan: {
    color: '#B99AFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    marginTop: 22,
    textAlign: 'center',
  },

  topGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#A78BFA',
    top: -190,
    alignSelf: 'center',
  },

  bottomGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(94, 53, 177, 0.18)',
    bottom: -190,
    alignSelf: 'center',
  },

  loader: {
    position: 'absolute',
    bottom: 85,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 12,
  },

  loadingText: {
    color: '#BDB0D8',
    fontSize: 12,
    letterSpacing: 0.5,
  },

  version: {
    position: 'absolute',
    bottom: 28,
    alignSelf: 'center',
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    letterSpacing: 1,
  },
});
