import { apiClient } from '@/core/http/api-client';
import { AdminRequestResponseDto } from '../../application/dtos/admin-request-response.dto';
import { CreateRequestDto } from '../../application/dtos/create-request.dto';
import { RequestResponseDto } from '../../application/dtos/request-response.dto';
import { UpdateRequestStatusDto } from '../../application/dtos/update-request-status.dto';
import {
  AdminPropertyRequest,
  PropertyRequest,
} from '../../domain/entities/request.entity';
import {
  RequestFilters,
  RequestRepository,
} from '../../domain/interfaces/request.repository';

function toPropertyRequest(dto: RequestResponseDto): PropertyRequest {
  return {
    id: dto.id,
    telefono: dto.telefono,
    userId: dto.userId,
    propertyId: dto.propertyId,
    status: dto.status,
    createdAt: new Date(dto.createdAt),
    // La API manda null (o nada) cuando la solicitud ya no está pendiente
    posicionListaEspera: dto.posicionListaEspera ?? null,
    cancelledByApplicant: dto.cancelledByApplicant ?? false,
  };
}

function toAdminRequest(dto: AdminRequestResponseDto): AdminPropertyRequest {
  return {
    ...toPropertyRequest(dto),
    applicant: dto.applicant,
    property: dto.property,
  };
}

export class RequestApiRepository implements RequestRepository {
  async create(dto: CreateRequestDto): Promise<PropertyRequest> {
    const data = await apiClient<RequestResponseDto>('/requests', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return toPropertyRequest(data);
  }

  async updateStatus(
    id: string,
    dto: UpdateRequestStatusDto,
  ): Promise<PropertyRequest> {
    const data = await apiClient<RequestResponseDto>(`/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
    return toPropertyRequest(data);
  }

  async findMine(): Promise<PropertyRequest[]> {
    const data = await apiClient<RequestResponseDto[]>('/requests/my-requests');
    return (data ?? []).map(toPropertyRequest);
  }

  async findAll(filters: RequestFilters = {}): Promise<AdminPropertyRequest[]> {
    const params = new URLSearchParams();
    if (filters.propertyId) params.set('propertyId', filters.propertyId);
    if (filters.status) params.set('status', filters.status);
    const query = params.toString();

    const data = await apiClient<AdminRequestResponseDto[]>(
      `/requests${query ? `?${query}` : ''}`,
    );
    return (data ?? []).map(toAdminRequest);
  }
}
