import { ApiError } from '@/core/http/api-client';
import { CreateRequestDto } from '@/modules/request/application/dtos/create-request.dto';
import { CreateRequestUseCase } from '@/modules/request/application/usecases/create-request.use-case';
import { PropertyRequest } from '@/modules/request/domain/entities/request.entity';
import { RequestApiRepository } from '@/modules/request/infrastructure/repositories/request-api.repository';
import { useState } from 'react';

const createRequestUseCase = new CreateRequestUseCase(new RequestApiRepository());

function toMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 403) return 'Tu cuenta no puede enviar solicitudes';
    if (err.status === 404) return 'La propiedad ya no está disponible';
  }
  // NetworkError y ApiError (400, 409...) ya traen un mensaje legible
  return err instanceof Error ? err.message : 'No se pudo enviar la solicitud';
}

export function useCreateRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<PropertyRequest | null>(null);

  /** Devuelve true si la solicitud se envió bien. */
  const create = async (dto: CreateRequestDto): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      setCreated(await createRequestUseCase.execute(dto));
      return true;
    } catch (err) {
      setError(toMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, created };
}
