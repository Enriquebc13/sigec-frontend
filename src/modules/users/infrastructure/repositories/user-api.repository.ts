import { apiClient } from '@/core/http/api-client';
import { CreateUserDto } from '../../application/dtos/create-user.dto';
import { UpdateUserDto } from '../../application/dtos/update-user.dto';
import { UserDetailResponseDto } from '../../application/dtos/user-detail-response.dto';
import { UserResponseDto } from '../../application/dtos/user-response.dto';
import { NewUser } from '../../domain/entities/new-user.entity';
import { UserChanges } from '../../domain/entities/user-changes.entity';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/interfaces/user.repository';

// Convierte lo que manda la API en la entidad que usa la app
const toUser = (dto: UserDetailResponseDto): User => ({
  id: dto.id,
  name: dto.name,
  lastname: dto.lastname,
  fullName: `${dto.name} ${dto.lastname}`.trim(),
  email: dto.email,
  role: dto.role,
  active: dto.active,
  createdAt: new Date(dto.createdAt),
});

export class UserApiRepository implements UserRepository {
  async getAll(): Promise<User[]> {
    const data = await apiClient<UserDetailResponseDto[]>('/users');
    return data.map(toUser);
  }

  async create(user: NewUser): Promise<void> {
    const body: CreateUserDto = {
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      password: user.password,
    };

    await apiClient<UserResponseDto>('/users', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

    async update(id: string, changes: UserChanges): Promise<void> {
    // Los campos undefined no se incluyen en el JSON, así que solo viajan los modificados
    const body: UpdateUserDto = {
      name: changes.name,
      lastname: changes.lastname,
      email: changes.email,
    };

    await apiClient<UserDetailResponseDto>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete(id: string): Promise<void> {
    await apiClient<void>(`/users/${id}`, { method: 'DELETE' });
  }
}