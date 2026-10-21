import { apiClient } from '@/core/http/api-client';
import { RequestResponseDto } from '../../application/dtos/request-response.dto';
import { Request } from '../../domain/entities/request.entity';
import { RequestRepository } from '../../domain/interfaces/request.repository';

const toRequest = (dto: RequestResponseDto): Request => {
  let userName = 'Sin usuario';
  if (typeof dto.user === 'string') {
    userName = dto.user;
  } else if (dto.user) {
    userName =
      dto.user.fullName ||
      `${dto.user.name ?? ''} ${dto.user.lastname ?? ''}`.trim() ||
      'Sin usuario';
  }

  let propertyName = 'Sin propiedad';
  if (typeof dto.property === 'string') {
    propertyName = dto.property;
  } else if (dto.property) {
    propertyName = dto.property.name || dto.property.title || 'Sin propiedad';
  }

  return {
    id: dto.id,
    telefono: dto.telefono,
    status: dto.status,
    createdAt: new Date(dto.createdAt),
    userName,
    propertyName,
    history: dto.history ?? [],
  };
};

export class RequestApiRepository implements RequestRepository {
  async getMyRequests(): Promise<Request[]> {
    const data = await apiClient<RequestResponseDto[]>('/requests/my-requests');
    return data.map(toRequest);
  }
}