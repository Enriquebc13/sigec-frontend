import { useAdminDrawerCounts, useClientDrawerCounts } from '@/components/navigation/drawer-counts';
import { useApiAuth } from '@/modules/auth-api/presentation/context/ApiAuthProvider';
import { getHomeRoute } from '@/modules/auth-api/presentation/utils/get-home-route';
import { useUserById } from '@/modules/users/presentation/admin/hooks/use-user-by-id';
import AntDesign from '@expo/vector-icons/AntDesign';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, Redirect, router } from 'expo-router';
import { ComponentProps, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { WelcomeScreen, WelcomeShortcut } from './components/WelcomeScreen';
import { completeWelcome } from './welcome-services';

const ICON = (name: ComponentProps<typeof AntDesign>['name']) => (
  <AntDesign name={name} size={24} color="#D7C9FF" />
);

const timeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

// Cuánto se espera el nombre del perfil antes de saludar con el correo (red lenta)
const NAME_WAIT_MS = 4000;

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * Bienvenida que se ve justo después de iniciar sesión, solo la primera vez de
 * cada usuario (el LoginForm decide si se muestra). Al abrir la app con una
 * sesión ya guardada se va directo al Home.
 */
export default function WelcomeView() {
  const { session } = useApiAuth();
  const { user, loading } = useUserById(session?.userId);
  const userId = session?.userId;
  const [gaveUp, setGaveUp] = useState(false);

  // Si el perfil tarda demasiado, se saluda con el correo en vez de dejar al usuario esperando
  useEffect(() => {
    const timer = setTimeout(() => setGaveUp(true), NAME_WAIT_MS);
    return () => clearTimeout(timer);
  }, []);

  // Se marca al mostrarse: si cierran la app en plena bienvenida, no se repite
  useEffect(() => {
    if (userId) completeWelcome.execute(userId);
  }, [userId]);

  // Sin sesión no hay a quién saludar
  if (!session) return <Redirect href={'/login' as Href} />;

  // Se espera al perfil para no mostrar primero el correo y luego cambiarlo por el nombre.
  // La bienvenida se monta ya con el nombre final, así sus animaciones empiezan completas.
  if (loading && !gaveUp) return <WelcomeLoading />;

  // Primer nombre; si el perfil no llegó (error o espera agotada), la parte local del correo
  const name = user?.name?.trim().split(' ')[0] || session.email.split('@')[0];
  const goHome = () => router.replace(getHomeRoute(session.role));

  return session.role === 'ADMIN' ? (
    <AdminWelcome name={name} onContinue={goHome} />
  ) : (
    <ClientWelcome name={name} onContinue={goHome} />
  );
}

/** Mismo fondo que la bienvenida mientras llega el nombre, para que no haya destello. */
function WelcomeLoading() {
  return (
    <LinearGradient
      colors={['#5E35B1', '#1A0B2E', '#000000']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.loading}
    >
      <ActivityIndicator size="large" color="#C7B5FF" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

type RoleProps = { name: string; onContinue: () => void };

function AdminWelcome({ name, onContinue }: RoleProps) {
  // Mismas cifras del menú: aquí solo se usa cuántas solicitudes esperan respuesta
  const { counts } = useAdminDrawerCounts();
  const pending = counts.waitlist;

  const shortcuts: WelcomeShortcut[] = [
    {
      title: 'Propiedades',
      description: 'Gestiona tus espacios comerciales.',
      icon: ICON('shop'),
      route: '/(admin)/properties' as Href,
    },
    {
      title: 'Solicitudes',
      description:
        pending === undefined
          ? 'Revisa las solicitudes recibidas.'
          : pending === 0
            ? 'No tienes solicitudes pendientes.'
            : `Tienes ${plural(pending, 'solicitud pendiente', 'solicitudes pendientes')}.`,
      icon: ICON('file-text'),
      route: '/(admin)/requests' as Href,
    },
    {
      title: 'Usuarios',
      description: 'Administra las cuentas.',
      icon: ICON('team'),
      route: '/(admin)/users' as Href,
    },
    {
      title: 'Reportes',
      description: 'Consulta el rendimiento.',
      icon: ICON('bar-chart'),
      route: '/(admin)/reports-users' as Href,
    },
  ];

  return (
    <WelcomeScreen
      name={name}
      timeGreeting={timeGreeting()}
      message="Tu espacio de administración está listo. Hoy es un buen día para mantener todo en orden."
      sectionTitle="Tu panel de administración"
      shortcuts={shortcuts}
      ctaLabel="Continuar al panel"
      onContinue={onContinue}
    />
  );
}

function ClientWelcome({ name, onContinue }: RoleProps) {
  const { counts } = useClientDrawerCounts();
  const sent = counts.requests;

  const shortcuts: WelcomeShortcut[] = [
    {
      title: 'Explorar propiedades',
      description: 'Descubre locales, oficinas y bodegas disponibles.',
      icon: ICON('shop'),
      route: '/(client)/properties' as Href,
    },
    {
      title: 'Mis solicitudes',
      description:
        sent === undefined || sent === 0
          ? 'Consulta el estado de tus solicitudes.'
          : `Has enviado ${plural(sent, 'solicitud', 'solicitudes')}. Consulta su estado.`,
      icon: ICON('file-text'),
      route: '/(client)/requests' as Href,
    },
  ];

  return (
    <WelcomeScreen
      name={name}
      timeGreeting={timeGreeting()}
      message="Encuentra el espacio ideal para hacer crecer tus proyectos. Estamos aquí para ayudarte."
      sectionTitle="¿Qué te gustaría hacer hoy?"
      shortcuts={shortcuts}
      ctaLabel="Entrar a SIGEC"
      onContinue={onContinue}
    />
  );
}