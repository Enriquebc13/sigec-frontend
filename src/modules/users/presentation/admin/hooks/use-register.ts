import { CreateUserUseCase } from '@/modules/users/application/usecases/create-user.use-case';
import { NewUser } from '@/modules/users/domain/entities/new-user.entity';
import { UserApiRepository } from '@/modules/users/infrastructure/repositories/user-api.repository';
import { useState } from 'react';

const createUserUseCase = new CreateUserUseCase(new UserApiRepository());

export function useRegister() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Devuelve true si se creó, para que la vista decida a dónde navegar
  const register = async (data: NewUser): Promise<boolean> => {
    setSubmitting(true);
    setError(null);
    try {
      await createUserUseCase.execute(data);
      return true;
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo crear la cuenta');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { register, submitting, error };
}