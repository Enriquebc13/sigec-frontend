import { DeleteUserUseCase } from '@/modules/users/application/usecases/delete-user.use-case';
import { GetUsersUseCase } from '@/modules/users/application/usecases/get-users.use-case';
import { User } from '@/modules/users/domain/entities/user.entity';
import { UserApiRepository } from '@/modules/users/infrastructure/repositories/user-api.repository';
import { useCallback, useEffect, useState } from 'react';

// Un solo repositorio compartido por los dos casos de uso
const repository = new UserApiRepository();
const getUsersUseCase = new GetUsersUseCase(repository);
const deleteUserUseCase = new DeleteUserUseCase(repository);

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

  // Si la API falla, lanza el error para que la vista lo muestre.
  // La lista solo se actualiza cuando el borrado fue exitoso.
  const deleteUser = useCallback(async (id: string) => {
    await deleteUserUseCase.execute(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  return { users, loading, refreshing, refresh, error, deleteUser };
}