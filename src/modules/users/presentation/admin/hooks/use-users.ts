import { DeleteUserUseCase } from '@/modules/users/application/usecases/delete-user.use-case';
import { GetUsersUseCase } from '@/modules/users/application/usecases/get-users.use-case';
import { UpdateUserUseCase } from '@/modules/users/application/usecases/update-user.use-case';
import { UserChanges } from '@/modules/users/domain/entities/user-changes.entity';
import { User } from '@/modules/users/domain/entities/user.entity';
import { UserApiRepository } from '@/modules/users/infrastructure/repositories/user-api.repository';
import { useCallback, useEffect, useState } from 'react';

// Un solo repositorio compartido por los dos casos de uso
const repository = new UserApiRepository();
const getUsersUseCase = new GetUsersUseCase(repository);
const updateUserUseCase = new UpdateUserUseCase(repository);
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

const updateUser = useCallback(async (id: string, changes: UserChanges) => {
    const saved = await updateUserUseCase.execute(id, changes);
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const name = saved.name ?? u.name;
        const lastname = saved.lastname ?? u.lastname;
        return {
          ...u,
          name,
          lastname,
          fullName: `${name} ${lastname}`.trim(),
          email: saved.email ?? u.email,
        };
      }),
    );
  }, []);

  return { users, loading, refreshing, refresh, error, deleteUser, updateUser  };
}