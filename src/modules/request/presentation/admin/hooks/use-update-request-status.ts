import { ApiError } from '@/core/http/api-client';
import { UpdateRequestStatusUseCase } from '@/modules/request/application/usecases/update-request-status.use-case';
import { DecisionStatus } from '@/modules/request/domain/entities/request.entity';
import { RequestApiRepository } from '@/modules/request/infrastructure/repositories/request-api.repository';
import { useState } from 'react';

const updateRequestStatusUseCase = new UpdateRequestStatusUseCase(
  new RequestApiRepository(),
);

function toMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 403) return 'Solo un administrador puede cambiar el estado';
    if (err.status === 404) return 'La solicitud ya no existe';
  }
  return err instanceof Error ? err.message : 'No se pudo actualizar la solicitud';
}

export function useUpdateRequestStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Devuelve true si el estado se actualizó bien. */
  const update = async (
    requestId: string,
    status: DecisionStatus,
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await updateRequestStatusUseCase.execute(requestId, status);
      return true;
    } catch (err) {
      setError(toMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}
