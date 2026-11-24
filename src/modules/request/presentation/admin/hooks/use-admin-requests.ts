import { ApiError } from '@/core/http/api-client';
import { GetAdminRequestsUseCase } from '@/modules/request/application/usecases/get-admin-requests.use-case';
import { AdminPropertyRequest } from '@/modules/request/domain/entities/request.entity';
import { RequestApiRepository } from '@/modules/request/infrastructure/repositories/request-api.repository';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

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

/** Todas las solicitudes (solo ADMIN), de la más reciente a la más antigua. */
export function useAdminRequests() {
  const [requests, setRequests] = useState<AdminPropertyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setError(null);
      setRequests(await getAdminRequestsUseCase.execute());
    } catch (e) {
      setError(toMessage(e));
    }
  }, []);

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
