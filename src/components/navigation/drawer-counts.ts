import { GetPropertiesUseCase } from '@/modules/property/application/usecases/get-properties.use-case';
import { PropertyApiRepository } from '@/modules/property/infrastructure/repositories/property-api.repository';
import { GetAdminRequestsUseCase } from '@/modules/request/application/usecases/get-admin-requests.use-case';
import { GetMyRequestsUseCase } from '@/modules/request/application/usecases/get-my-requests.use-case';
import { RequestApiRepository } from '@/modules/request/infrastructure/repositories/request-api.repository';
import { GetUsersUseCase } from '@/modules/users/application/usecases/get-users.use-case';
import { UserApiRepository } from '@/modules/users/infrastructure/repositories/user-api.repository';
import { DrawerCounts, useDrawerCounts } from './use-drawer-counts';

const getProperties = new GetPropertiesUseCase(new PropertyApiRepository());
const getMyRequests = new GetMyRequestsUseCase(new RequestApiRepository());
const getAdminRequests = new GetAdminRequestsUseCase(new RequestApiRepository());
const getUsers = new GetUsersUseCase(new UserApiRepository());

// Si una de las consultas falla, esa cifra queda sin actualizarse y las demás sí
const valueOf = <T>(result: PromiseSettledResult<T>) =>
  result.status === 'fulfilled' ? result.value : undefined;

/**
 * Cliente:
 * - properties: propiedades del catálogo.
 * - requests: solicitudes que ha enviado.
 * - waitlist: listas de espera en las que está (solicitudes pendientes con lugar en la fila).
 */
async function loadClientCounts(): Promise<DrawerCounts> {
  const [properties, mine] = await Promise.allSettled([getProperties.execute(), getMyRequests.execute()]);
  const requests = valueOf(mine);
  return {
    properties: valueOf(properties)?.length,
    requests: requests?.length,
    waitlist: requests?.filter((r) => r.status === 'PENDING' && r.posicionListaEspera !== null).length,
  };
}

/**
 * Admin:
 * - users / properties / requests: totales registrados.
 * - waitlist: personas esperando ahora (solicitudes pendientes), que es lo que
 *   las "Listas de espera" muestran repartido por propiedad.
 */
async function loadAdminCounts(): Promise<DrawerCounts> {
  const [users, properties, requests] = await Promise.allSettled([
    getUsers.execute(),
    getProperties.execute(),
    getAdminRequests.execute(),
  ]);
  const all = valueOf(requests);
  return {
    users: valueOf(users)?.length,
    properties: valueOf(properties)?.length,
    requests: all?.length,
    waitlist: all?.filter((r) => r.status === 'PENDING').length,
  };
}

export const useClientDrawerCounts = () => useDrawerCounts(loadClientCounts);
export const useAdminDrawerCounts = () => useDrawerCounts(loadAdminCounts);
