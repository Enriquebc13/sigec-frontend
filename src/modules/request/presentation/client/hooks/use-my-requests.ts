import { GetMyRequestsUseCase } from "@/modules/request/application/usecases/get-my-requests.use-case";
import { Request } from "@/modules/request/domain/entities/request.entity";
import { RequestApiRepository } from "@/modules/request/infrastructure/repositories/request-api.repository";
import { useCallback, useEffect, useState } from "react";

const repository = new RequestApiRepository();
const getMyRequestsUseCase = new GetMyRequestsUseCase(repository);

export function useMyRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setError(null);
      const data = await getMyRequestsUseCase.execute();
      setRequests(data);
    } catch (e: any) {
      setError(e?.message ?? "No se pudieron cargar tus solicitudes.");
    }
  }, []);

  useEffect(() => {
    fetchRequests().finally(() => setLoading(false));
  }, [fetchRequests]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  }, [fetchRequests]);

  return { requests, loading, refreshing, error, refresh };
}
