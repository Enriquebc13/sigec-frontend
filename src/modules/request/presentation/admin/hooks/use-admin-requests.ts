import { ApiError } from '@/core/http/api-client';
import { GetAdminRequestsUseCase } from '@/modules/request/application/usecases/get-admin-requests.use-case';
import { AdminPropertyRequest } from '@/modules/request/domain/entities/request.entity';
import { RequestFilters } from '@/modules/request/domain/interfaces/request.repository';
import { RequestApiRepository } from '@/modules/request/infrastructure/repositories/request-api.repository';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

const getAdminRequestsUseCase = new GetAdminRequestsUseCase(
  new RequestApiRepository(),
);

function toMessage(err: unknown): string {
  if (err instanceof ApiError && err.status === 403) {
    return 'No tienes permisos para ver las solicitudes';
  }
  return err instanceof Error
    ? err.message
    : 'No se pudieron cargar las solicitudes';
}

/**
 * Solicitudes (solo ADMIN), de la más reciente a la más antigua.
 * Sin argumentos trae todas; con `filters` usa GET /requests?propertyId=…&status=…
 */
export function useAdminRequests(filters: RequestFilters = {}) {
  const { propertyId, status } = filters;
  const [requests, setRequests] = useState<AdminPropertyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setError(null);
      setRequests(await getAdminRequestsUseCase.execute({ propertyId, status }));
    } catch (e) {
      setError(toMessage(e));
    }
  }, [propertyId, status]);

  // Si cambia el filtro (otra propiedad), no muestres las solicitudes de la anterior
  useEffect(() => {
    setRequests([]);
    setLoading(true);
  }, [propertyId, status]);

  useFocusEffect(
    useCallback(() => {
      reload().finally(() => setLoading(false));
    }, [reload]),
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  return { requests, loading, refreshing, error, refresh, reload };
}
