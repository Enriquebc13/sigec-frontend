import { ApiError } from '@/core/http/api-client';
import { CancelRequestUseCase } from '@/modules/request/application/usecases/cancel-request.use-case';
import { RequestStatus } from '@/modules/request/domain/entities/request.entity';
import { RequestApiRepository } from '@/modules/request/infrastructure/repositories/request-api.repository';
import { useCallback, useState } from 'react';

const useCase = new CancelRequestUseCase(new RequestApiRepository());

function toMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 403) return 'Esta solicitud no te pertenece';
    if (err.status === 404) return 'La solicitud ya no existe';
    if (err.status === 409) return err.message;
  }
  // NetworkError y ApiError (400...) ya traen un mensaje legible
  return err instanceof Error ? err.message : 'No se pudo cancelar la solicitud';
}

export function useCancelRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Devuelve true si la operación salió bien. */
  const cancel = async (id: string, status: RequestStatus): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await useCase.execute(id, status);
      return true;
    } catch (err) {
      setError(toMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  /** Limpia el error al abrir o cerrar el diálogo. */
  const reset = useCallback(() => setError(null), []);

  return { cancel, loading, error, reset };
}
