import { GetMyRequestsUseCase } from '@/modules/request/application/usecases/get-my-requests.use-case';
import { PropertyRequest } from '@/modules/request/domain/entities/request.entity';
import { RequestApiRepository } from '@/modules/request/infrastructure/repositories/request-api.repository';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

const getMyRequestsUseCase = new GetMyRequestsUseCase(new RequestApiRepository());

/**
 * Solicitudes del cliente. Se vuelven a pedir cada vez que la pantalla gana
 * foco, así una solicitud creada desde el catálogo aparece al instante en
 * "Solicitudes" aunque el drawer mantenga la pantalla montada.
 */
export function useMyRequests() {
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Recarga sin mostrar indicadores (la lista actual se queda visible). */
  const reload = useCallback(async () => {
    try {
      setError(null);
      setRequests(await getMyRequestsUseCase.execute());
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'No se pudieron cargar tus solicitudes.',
      );
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload().finally(() => setLoading(false));
    }, [reload]),
  );

  /** Pull-to-refresh / botón "Actualizar". */
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  return { requests, loading, refreshing, error, refresh, reload };
}
