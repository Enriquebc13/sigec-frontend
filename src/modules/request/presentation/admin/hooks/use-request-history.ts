import { GetRequestHistoryUseCase } from '@/modules/request/application/usecases/get-request-history.use-case';
import { RequestHistory } from '@/modules/request/domain/entities/request-history.entity';
import { RequestHistoryApiRepository } from '@/modules/request/infrastructure/repositories/request-history-api.repository';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

const getRequestHistoryUseCase = new GetRequestHistoryUseCase(
  new RequestHistoryApiRepository(),
);

/**
 * Historial de eventos agrupado por solicitud (id de solicitud → eventos, el
 * más reciente primero). Si falla, la lista de solicitudes sigue funcionando
 * y simplemente no hay línea de tiempo.
 */
export function useRequestHistory() {
  const [history, setHistory] = useState<RequestHistory[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setError(null);
      setHistory(await getRequestHistoryUseCase.execute());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el historial');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const byRequest = useMemo(() => {
    const map = new Map<string, RequestHistory[]>();
    for (const event of history) {
      const list = map.get(event.requestId) ?? [];
      list.push(event);
      map.set(event.requestId, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime());
    }
    return map;
  }, [history]);

  return { byRequest, error, reload };
}
