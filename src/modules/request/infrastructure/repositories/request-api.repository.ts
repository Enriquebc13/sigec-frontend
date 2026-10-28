import { apiClient } from '@/core/http/api-client';
import { CreateRequestDto } from '../../application/dtos/create-request.dto';
import { Request, RequestStatus } from '../../domain/entities/request.entity';
import { RequestRepository } from '../../domain/interfaces/request.repository';

const toRequest = (dto: any): Request => {
  const target = dto.request ? dto.request : dto;

  let userName = 'Sin usuario';
  if (typeof target.user === 'string') {
    userName = target.user;
  } else if (target.user) {
    userName =
      target.user.fullName ||
      `${target.user.name ?? ''} ${target.user.lastname ?? ''}`.trim() ||
      target.user.email ||
      'Sin usuario';
  } else if (dto.user) {
    userName =
      `${dto.user.name ?? ''} ${dto.user.lastname ?? ''}`.trim() ||
      dto.user.email ||
      'Sin usuario';
  }

  let propertyName = 'Sin propiedad';
  if (typeof target.property === 'string') {
    propertyName = target.property;
  } else if (target.property) {
    propertyName = target.property.title || target.property.name || 'Sin propiedad';
  }

  let history: string[] = [];
  if (Array.isArray(target.history)) {
    history = target.history.map((h: any) => (typeof h === 'string' ? h : h.action));
  } else if (dto.action) {
    history = [dto.action];
  }

  return {
    id: target.id ?? dto.id,
    telefono: target.telefono ?? 'Sin teléfono',
    status: (target.status ?? 'PENDING') as RequestStatus,
    createdAt: new Date(target.createdAt ?? dto.changedAt ?? Date.now()),
    userName,
    propertyName,
    history,
  };
};

export class RequestApiRepository implements RequestRepository {
  async getMyRequests(): Promise<Request[]> {
    const data = await apiClient<any[]>('/requests/my-requests');
    return Array.isArray(data) ? data.map(toRequest) : [];
  }

  async getAll(): Promise<Request[]> {
    try {
      const data = await apiClient<any[]>('/requests');
      return Array.isArray(data) ? data.map(toRequest) : [];
    } catch {
      const data = await apiClient<any[]>('/requests/history');
      return Array.isArray(data) ? data.map(toRequest) : [];
    }
  }

  async create(input: CreateRequestDto): Promise<Request> {
    const data = await apiClient<any>(
      '/requests',
      { method: 'POST', body: JSON.stringify(input) },
    );
    return toRequest(data);
  }

  async updateStatus(id: string, status: RequestStatus): Promise<Request> {
    const data = await apiClient<any>(
      `/requests/${encodeURIComponent(id)}/status`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
    );
    return toRequest(data);
  }

  async delete(id: string): Promise<void> {
    await apiClient<void>(`/requests/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }
}
