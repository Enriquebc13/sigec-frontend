import { GetUserByIdUseCase } from '@/modules/users/application/usecases/get-user-by-id.use-case';
import { User } from '@/modules/users/domain/entities/user.entity';
import { UserApiRepository } from '@/modules/users/infrastructure/repositories/user-api.repository';
import { useEffect, useState } from 'react';

const getUserByIdUseCase = new GetUserByIdUseCase(new UserApiRepository());

// Recibe el id como parámetro para que el módulo users no dependa del de auth
export function useUserById(id?: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setUser(null);
      setLoading(false);
      return;
    }

    let cancelled = false; // evita actualizar el estado si la pantalla ya se cerró
    setLoading(true);
    setError(null);

    getUserByIdUseCase
      .execute(id)
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? 'No se pudo cargar el perfil');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { user, loading, error };
}