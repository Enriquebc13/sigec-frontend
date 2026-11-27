
import { PressableScale } from '@/components/animation/PressableScale';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { completeOnboarding } from './onboarding-services';
import { ONBOARDING_SLIDES, OnboardingSlide } from './onboarding-slides';

const ART_SIZE = 210;

export default function OnboardingView() {
  const { replay } = useLocalSearchParams<{ replay?: string }>();
  const isReplay = replay === '1';

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const finishing = useRef(false);

  const scrollX = useSharedValue(0);
  const glow = useSharedValue(0);

  const [index, setIndex] = useState(0);

  const last = ONBOARDING_SLIDES.length - 1;
  const isFirst = index === 0;
  const isLast = index === last;

  useEffect(() => {
    glow.value = withRepeat(
      withTiming(1, {
        duration: 2400,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [glow]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.12 + glow.value * 0.15,
    transform: [{ scale: 0.9 + glow.value * 0.12 }],
  }));

  const goTo = useCallback(
    (next: number) => {
      if (next < 0 || next > last) return;

      listRef.current?.scrollToIndex({
        index: next,
        animated: true,
      });

      setIndex(next);
    },
    [last],
  );

  const finish = useCallback(async () => {
    if (finishing.current) return;

    finishing.current = true;

    try {
      if (isReplay) {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/' as Href);
        }
        return;
      }

      await completeOnboarding.execute();
      router.replace('/login' as Href);
    } catch (error) {
      finishing.current = false;
      console.error('Error al finalizar el onboarding:', error);
    }
  }, [isReplay]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (index > 0) {
        goTo(index - 1);
        return true;
      }

      return false;
    });

    return () => sub.remove();
  }, [index, goTo]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.set(e.nativeEvent.contentOffset.x);
  };

  const onMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Fondo principal */}
      <LinearGradient
        colors={['#5E35B1', '#281447', '#12091F', '#000000']}
        locations={[0, 0.38, 0.72, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Iluminación decorativa */}
      <Animated.View style={[styles.topGlow, glowStyle]} />
      <View style={styles.bottomGlow} />

      {/* Encabezado */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <View style={styles.brand}>
          <View style={styles.brandIcon}>
            <Ionicons name="business" size={17} color="#FFFFFF" />
          </View>
          <Text style={styles.brandText}>SIGEC</Text>
        </View>

        <Pressable
          onPress={finish}
          disabled={isLast}
          hitSlop={12}
          style={[styles.skip, isLast && styles.hidden]}
          accessibilityRole="button"
          accessibilityLabel={
            isReplay ? 'Cerrar introducción' : 'Omitir introducción'
          }
        >
          <Text style={styles.skipText}>
            {isReplay ? 'Cerrar' : 'Omitir'}
          </Text>
          <Ionicons name="arrow-forward" size={15} color="#D7C9FF" />
        </Pressable>
      </View>

      {/* Carrusel */}
      <FlatList
        ref={listRef}
        data={ONBOARDING_SLIDES}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={({ item, index: i }) => (
          <Slide
            slide={item}
            position={i}
            width={width}
            scrollX={scrollX}
          />
        )}
      />

      {/* Pie de pantalla */}
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 16) + 14 },
        ]}
      >
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>
            PASO {index + 1} DE {ONBOARDING_SLIDES.length}
          </Text>
          <Text style={styles.progressPercent}>
            {Math.round(((index + 1) / ONBOARDING_SLIDES.length) * 100)}%
          </Text>
        </View>

        <View style={styles.dots}>
          {ONBOARDING_SLIDES.map((slide, i) => (
            <Dot
              key={slide.id}
              position={i}
              width={width}
              scrollX={scrollX}
            />
          ))}
        </View>

        <View style={styles.buttons}>
          {!isFirst && (
            <PressableScale
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => goTo(index - 1)}
              accessibilityRole="button"
              accessibilityLabel="Diapositiva anterior"
            >
              <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
              <Text style={styles.buttonText}>Atrás</Text>
            </PressableScale>
          )}

          <PressableScale
            style={[
              styles.button,
              styles.buttonPrimary,
              isFirst && styles.firstButton,
            ]}
            onPress={() => (isLast ? finish() : goTo(index + 1))}
            accessibilityRole="button"
            accessibilityLabel={
              isLast ? 'Terminar introducción' : 'Siguiente diapositiva'
            }
          >
            <Text style={styles.buttonText}>
              {isLast
                ? isReplay
                  ? 'Listo'
                  : 'Comenzar'
                : 'Siguiente'}
            </Text>

            <Ionicons
              name={isLast ? 'checkmark-circle-outline' : 'arrow-forward'}
              size={19}
              color="#FFFFFF"
            />
          </PressableScale>
        </View>
      </View>
    </View>
  );
}

type SlideProps = {
  slide: OnboardingSlide;
  position: number;
  width: number;
  scrollX: SharedValue<number>;
};

function Slide({ slide, position, width, scrollX }: SlideProps) {
  const artStyle = useAnimatedStyle(() => {
    const range = [
      (position - 1) * width,
      position * width,
      (position + 1) * width,
    ];

    return {
      opacity: interpolate(
        scrollX.get(),
        range,
        [0.2, 1, 0.2],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          scale: interpolate(
            scrollX.get(),
            range,
            [0.82, 1, 0.82],
            Extrapolation.CLAMP,
          ),
        },
        {
          translateY: interpolate(
            scrollX.get(),
            range,
            [20, 0, 20],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const range = [
      (position - 1) * width,
      position * width,
      (position + 1) * width,
    ];

    return {
      opacity: interpolate(
        scrollX.get(),
        range,
        [0.3, 1, 0.3],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateY: interpolate(
            scrollX.get(),
            range,
            [18, 0, 18],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  return (
    <View style={[styles.slide, { width }]}>
      <View style={styles.welcomeBadge}>
        <Ionicons name="sparkles" size={14} color="#D7C9FF" />
        <Text style={styles.welcomeText}>CONOCE SIGEC</Text>
      </View>

      {/* Ilustración */}
      <Animated.View style={[styles.artContainer, artStyle]}>
        <View style={styles.artGlow} />

        <LinearGradient
          colors={['rgba(139,92,246,0.35)', 'rgba(94,53,177,0.08)']}
          style={styles.artCircle}
        >
          {slide.image ? (
            <Image
              source={slide.image}
              style={styles.artImage}
              resizeMode="contain"
              accessibilityLabel="Logo de SIGEC"
            />
          ) : (
            <View style={styles.iconCircle}>
              <Ionicons
                name={slide.icon ?? 'business-outline'}
                size={88}
                color="#E9DFFF"
              />
            </View>
          )}
        </LinearGradient>
      </Animated.View>

      {/* Información de la diapositiva */}
      <Animated.View style={[styles.textBlock, textStyle]}>
        <Text style={styles.title}>{slide.title}</Text>

        <View style={styles.titleLine} />

        <Text style={styles.description}>
          {slide.description}
        </Text>
      </Animated.View>
    </View>
  );
}

function Dot({
  position,
  width,
  scrollX,
}: {
  position: number;
  width: number;
  scrollX: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const range = [
      (position - 1) * width,
      position * width,
      (position + 1) * width,
    ];

    return {
      width: interpolate(
        scrollX.get(),
        range,
        [8, 25, 8],
        Extrapolation.CLAMP,
      ),
      opacity: interpolate(
        scrollX.get(),
        range,
        [0.3, 1, 0.3],
        Extrapolation.CLAMP,
      ),
    };
  });

  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A0B2E',
    overflow: 'hidden',
  },

  topGlow: {
    position: 'absolute',
    width: 330,
    height: 330,
    borderRadius: 165,
    backgroundColor: '#A78BFA',
    top: -220,
    alignSelf: 'center',
  },

  bottomGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(94,53,177,0.2)',
    bottom: -220,
    alignSelf: 'center',
  },

  topBar: {
    minHeight: 70,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },

  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  brandIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 2,
  },

  skip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },

  skipText: {
    color: '#D7C9FF',
    fontSize: 13,
    fontWeight: '600',
  },

  hidden: {
    opacity: 0,
  },

  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 18,
  },

  welcomeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(199,181,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(199,181,255,0.20)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
    marginBottom: 28,
  },

  welcomeText: {
    color: '#D7C9FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },

  artContainer: {
    width: ART_SIZE + 24,
    height: ART_SIZE + 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 34,
  },

  artGlow: {
    position: 'absolute',
    width: ART_SIZE,
    height: ART_SIZE,
    borderRadius: ART_SIZE / 2,
    backgroundColor: 'rgba(139,92,246,0.23)',
  },

  artCircle: {
    width: ART_SIZE,
    height: ART_SIZE,
    borderRadius: ART_SIZE / 2,
    borderWidth: 1,
    borderColor: 'rgba(215,201,255,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  artImage: {
    width: 145,
    height: 145,
  },

  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  textBlock: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 5,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 38,
  },

  titleLine: {
    width: 42,
    height: 3,
    borderRadius: 5,
    backgroundColor: '#B99AFF',
    marginTop: 17,
    marginBottom: 17,
  },

  description: {
    color: '#D6D0E3',
    fontSize: 15,
    lineHeight: 25,
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 0.2,
  },

  footer: {
    paddingHorizontal: 25,
    paddingTop: 14,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  progressLabel: {
    color: '#A99BBE',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  progressPercent: {
    color: '#D7C9FF',
    fontSize: 11,
    fontWeight: '700',
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    marginBottom: 23,
  },

  dot: {
    height: 7,
    borderRadius: 5,
    backgroundColor: '#D7C9FF',
  },

  buttons: {
    flexDirection: 'row',
    gap: 12,
  },

  button: {
    flex: 1,
    minHeight: 55,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderWidth: 1,
  },

  buttonPrimary: {
    backgroundColor: '#6846A8',
    borderColor: 'rgba(215,201,255,0.4)',
  },

  firstButton: {
    flex: 1,
  },

  buttonSecondary: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.2)',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
