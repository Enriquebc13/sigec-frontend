// import { useAuth } from '@/modules/auth/presentation/context/AuthProvider';
// import { Redirect, type Href } from 'expo-router';
// import * as SplashScreen from 'expo-splash-screen';
// import { useEffect } from 'react';
// import { ActivityIndicator, StyleSheet, View } from 'react-native';

// SplashScreen.preventAutoHideAsync();

// export default function IndexScreen() {
//   const { loading, checkLogued } = useAuth();

//   useEffect(() => {
//     if (!loading) {
//       SplashScreen.hideAsync();
//     }
//   }, [loading]);

//   if (loading) {
//     return (
//         <View style={styles.container}>
//           <ActivityIndicator size="large" />
//         </View>
      
//     );
//   }

// return (
//   <Redirect
//     href={
//         //  Cambiar ruta
//             (checkLogued() ? '/(client)/home' : '/login') as Href
//     }
//   />
// );

// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

import { AnimatedSplash } from '@/components/splash/AnimatedSplash';
import { useMinimumSplashTime } from '@/components/splash/use-minimum-splash-time';
import { useApiAuth } from '@/modules/auth-api/presentation/context/ApiAuthProvider';
import { getHomeRoute } from '@/modules/auth-api/presentation/utils/get-home-route';
import { completeOnboarding } from '@/modules/onboarding/presentation/onboarding-services';
import { useOnboardingSeen } from '@/modules/onboarding/presentation/use-onboarding-seen';
import { Redirect, type Href } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

// Tiempo mínimo que se ve el splash animado (ms), aunque todo cargue antes
const SPLASH_MIN_MS = 1600;

export default function IndexScreen() {
  // loading: true mientras se restaura la sesión guardada en el dispositivo
  // session: null si no hay sesión (o el token venció); si existe, trae el rol
  const { loading: authLoading, session } = useApiAuth();
  // ¿Este dispositivo ya vio el intro?
  const { loading: onboardingLoading, seen } = useOnboardingSeen();
  const minTimeElapsed = useMinimumSplashTime(SPLASH_MIN_MS);

  const ready = !authLoading && !onboardingLoading && minTimeElapsed;

  // Sesión guardada antes de existir el intro (alguien que ya usaba la app y se
  // actualizó): ya conoce SIGEC, se marca como visto para no mostrárselo al cerrar sesión
  useEffect(() => {
    if (!authLoading && !onboardingLoading && session && !seen) {
      completeOnboarding.execute();
    }
  }, [authLoading, onboardingLoading, session, seen]);

  // El splash nativo se oculta cuando el animado ya se dibujó (sin destello en medio)
  if (!ready) {
    return <AnimatedSplash onReady={() => SplashScreen.hideAsync()} />;
  }

  // 1) sesión válida → home por rol  2) sin sesión y sin intro → intro  3) sin sesión → login
  const target = session
    ? getHomeRoute(session.role)
    : ((seen ? '/login' : '/onboarding') as Href);

  return <Redirect href={target} />;
}
