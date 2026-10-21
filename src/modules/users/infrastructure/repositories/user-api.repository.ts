import { apiClient } from '@/core/http/api-client';
import { UserDetailResponseDto } from '../../application/dtos/user-detail-response.dto';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/interfaces/user.repository';

const toUser = (dto: UserDetailResponseDto): User => ({
  id: dto.id,
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
}