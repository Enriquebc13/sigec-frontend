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

import { useApiAuth } from '@/modules/auth-api/presentation/context/ApiAuthProvider';
import { getHomeRoute } from '@/modules/auth-api/presentation/utils/get-home-route';
import { Redirect, type Href } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function IndexScreen() {
  // loading: true mientras se restaura la sesión guardada en el dispositivo
  // session: null si no hay sesión; si existe, trae el rol del usuario
  const { loading, session } = useApiAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Redirect
      href={session ? getHomeRoute(session.role) : ('/login' as Href)}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});