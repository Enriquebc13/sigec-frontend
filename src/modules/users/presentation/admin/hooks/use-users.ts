import { GetUsersUseCase } from '@/modules/users/application/usecases/get-users.use-case';
import { User } from '@/modules/users/domain/entities/user.entity';
import { UserApiRepository } from '@/modules/users/infrastructure/repositories/user-api.repository';
import { useCallback, useEffect, useState } from 'react';

const getUsersUseCase = new GetUsersUseCase(new UserApiRepository());

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setError(null);
      setUsers(await getUsersUseCase.execute());
    } catch (e: any) {
      setError(e?.message ?? 'Sin conexión con la API');
    }
  }, []);

  useEffect(() => {
    fetchUsers().finally(() => setLoading(false));
  }, [fetchUsers]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  }, [fetchUsers]);

  return { users, loading, refreshing, error, refresh };
}