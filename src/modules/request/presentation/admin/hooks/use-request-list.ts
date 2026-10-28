import { Request } from '@/modules/request/domain/entities/request.entity';
import { useCallback, useEffect, useState } from 'react';

// `fetcher` debe ser una función estable (definida fuera del componente)
export function useRequestList(fetcher: () => Promise<Request[]>) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      const result = await fetcher();
      setRequests(result);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Sin conexión con la API');
    }
  }, [fetcher]);

  useEffect(() => {
    let active = true;

    fetcher()
      .then((result) => {
        if (!active) return;
        setRequests(result);
        setError(null);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setError(error instanceof Error ? error.message : 'Sin conexión con la API');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetcher]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  }, [fetchRequests]);

  return { requests, loading, refreshing, error, refresh };
}