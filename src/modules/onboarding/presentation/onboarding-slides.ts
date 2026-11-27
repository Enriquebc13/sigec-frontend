import type { Ionicons } from '@expo/vector-icons';
import type { ImageSourcePropType } from 'react-native';
import type { ComponentProps } from 'react';

export type OnboardingSlide = {
  id: string;
  title: string;
  description: string;
  /** Imagen grande (solo la primera diapositiva usa el logo). */
  image?: ImageSourcePropType;
  /** Icono cuando no hay imagen. */
  icon?: ComponentProps<typeof Ionicons>['name'];
};

/** Contenido del intro. Para cambiar textos o agregar pasos, solo se edita aquí. */
export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'welcome',
    title: 'Bienvenido a SIGEC',
    description:
      'Tu plataforma para encontrar espacios comerciales: locales, oficinas y bodegas, todo en un solo lugar.',
    image: require('@/assets/images/Logo SIGEC_.png'),
  },
  {
    id: 'explore',
    title: 'Explora los espacios',
    description:
      'Consulta las propiedades disponibles con sus fotos y detalles para elegir la que mejor se adapte a tu negocio.',
    icon: 'storefront-outline',
  },
  {
    id: 'request',
    title: 'Envía tu solicitud',
    description:
      'Toca «Me interesa» en la propiedad que quieras. Si ya está reservada, tu solicitud entra a su lista de espera.',
    icon: 'paper-plane-outline',
  },
  {
    id: 'follow-up',
    title: 'Da seguimiento',
    description:
      'En «Solicitudes» verás si fue aprobada o rechazada, y en «Lista de espera» el lugar que ocupas en la fila.',
    icon: 'time-outline',
  },
];
