import { Href, router } from 'expo-router';

/**
 * Rutas hacia UNA propiedad concreta. Centralizadas aquí para que ninguna
 * pantalla vuelva a mandar al listado general.
 */

/** Admin: abre la propiedad (pantalla de edición, donde se cambia su estado). */
export const goToAdminProperty = (propertyId: string) =>
  router.navigate({ pathname: '/editProperty', params: { id: propertyId } } as unknown as Href);

/** Admin: solicitudes recibidas por esa propiedad. */
export const goToPropertyRequests = (propertyId: string) =>
  router.navigate({ pathname: '/propertyRequests', params: { id: propertyId } } as unknown as Href);

/** Admin: lista de espera de esa propiedad. */
export const goToPropertyWaitlist = (propertyId: string) =>
  router.navigate({ pathname: '/(admin)/waitlist', params: { property: propertyId } } as unknown as Href);

/** Cliente: catálogo enfocado en esa propiedad. */
export const goToClientProperty = (propertyId: string) =>
  router.navigate({ pathname: '/(client)/properties', params: { property: propertyId } } as unknown as Href);
