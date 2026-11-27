import { PressableScale } from '@/components/animation/PressableScale';
import { Reveal } from '@/components/animation/Reveal';
import { OptionCard } from '@/components/ui/OptionCard';
import { Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WavingHand } from './WavingHand';

export type WelcomeShortcut = {
  title: string;
  description: string;
  icon: ReactNode;
  route: Href;
};

type Props = {
  /** Primer nombre del usuario. */
  name: string;
  /** "Buenos días", "Buenas tardes"... */
  timeGreeting: string;
  /** Frase que cambia según el rol. */
  message: string;
  sectionTitle: string;
  shortcuts: WelcomeShortcut[];
  ctaLabel: string;
  onContinue: () => void;
};

// La mano entra primero; el texto empieza cuando termina de saludar
const TEXT_DELAY = 650;
const STAGGER = 110;
const MAX_DELAY = 1800;

/** Pantalla de bienvenida (presentacional): mano animada, saludo, accesos y botón. */
export function WelcomeScreen({
  name,
  timeGreeting,
  message,
  sectionTitle,
  shortcuts,
  ctaLabel,
  onContinue,
}: Props) {
  const insets = useSafeAreaInsets();
  const reveal = { delay: TEXT_DELAY, stagger: STAGGER, maxDelay: MAX_DELAY };

  return (
    <LinearGradient
      colors={['#5E35B1', '#1A0B2E', '#000000']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <WavingHand />

          <Reveal index={0} {...reveal}>
            <Text style={styles.timeGreeting}>{timeGreeting}</Text>
            <Text style={styles.hello} numberOfLines={2}>
              ¡Hola, {name}!
            </Text>
          </Reveal>

          <Reveal index={1} {...reveal}>
            <Text style={styles.title}>Bienvenido a SIGEC</Text>
          </Reveal>

          <Reveal index={2} {...reveal}>
            <Text style={styles.message}>{message}</Text>
          </Reveal>
        </View>

        <Reveal index={3} {...reveal}>
          <Text style={styles.sectionTitle}>{sectionTitle}</Text>
        </Reveal>

        {shortcuts.map((shortcut, i) => (
          <Reveal key={shortcut.title} index={4 + i} {...reveal}>
            <OptionCard {...shortcut} />
          </Reveal>
        ))}

        <Reveal index={4 + shortcuts.length} {...reveal}>
          <PressableScale style={styles.cta} onPress={onContinue} accessibilityRole="button">
            <Text style={styles.ctaText}>{ctaLabel}  →</Text>
          </PressableScale>
        </Reveal>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, flexGrow: 1, justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: 26 },
  timeGreeting: {
    color: '#C7B5FF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 14,
  },
  hello: { color: '#FFFFFF', fontSize: 34, fontWeight: 'bold', textAlign: 'center', marginTop: 6 },
  title: { color: '#E4DAFF', fontSize: 20, fontWeight: '600', textAlign: 'center', marginTop: 4 },
  message: {
    color: '#D6D0E3',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 8,
  },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 14 },
  cta: {
    marginTop: 10,
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#6846A8',
    borderWidth: 1,
    borderColor: 'rgba(199,181,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold' },
});
