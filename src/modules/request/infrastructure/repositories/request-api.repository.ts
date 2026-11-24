import { apiClient } from '@/core/http/api-client';
import { RequestResponseDto } from '../../application/dtos/request-response.dto';
import { Request, RequestStatus } from '../../domain/entities/request.entity';
import { RequestRepository } from '../../domain/interfaces/request.repository';

const toRequest = (raw: any): Request => {
  const target = raw?.request ?? raw;

  let userName = 'Sin usuario';
  if (typeof target?.user === 'string') {
    userName = target.user;
  } else if (target?.user) {
    userName =
      target.user.fullName ||
      `${target.user.name ?? ''} ${target.user.lastname ?? ''}`.trim() ||
      target.user.email ||
      'Sin usuario';
  } else if (target?.nombre || target?.apellidos) {
    userName = `${target.nombre ?? ''} ${target.apellidos ?? ''}`.trim() || 'Sin usuario';
  } else if (raw?.user) {
    userName =
      typeof raw.user === 'string'
        ? raw.user
        : `${raw.user.name ?? ''} ${raw.user.lastname ?? ''}`.trim() ||
          raw.user.email ||
          'Sin usuario';
  }

  let propertyName = 'Sin propiedad';
  if (typeof target?.property === 'string') {
    propertyName = target.property;
  } else if (target?.property) {
    propertyName =
      target.property.title || target.property.name || 'Sin propiedad';
  } else if (target?.propertyTitle) {
    propertyName = target.propertyTitle;
  } else if (target?.propertyName) {
    propertyName = target.propertyName;
  }

  let history: string[] = [];
  if (Array.isArray(target?.history)) {
    history = target.history.map((h: any) =>
      typeof h === 'string' ? h : h?.action ?? String(h),
    );
  } else if (raw?.action) {
    history = [raw.action];
  } else if (target?.action) {
    history = [target.action];
  }

  const rawDate = target?.createdAt ?? target?.fecha ?? raw?.changedAt;
  const createdAt = rawDate ? new Date(rawDate) : new Date();

  return {
    id: String(target?.id ?? raw?.id ?? ''),
    telefono: target?.telefono ?? 'Sin teléfono',
    status: (target?.status ?? 'PENDING') as RequestStatus,
    createdAt: isNaN(createdAt.getTime()) ? new Date() : createdAt,
    userName,
    propertyName,
    history,
  };
};

export class RequestApiRepository implements RequestRepository {
  async getMyRequests(): Promise<Request[]> {
    try {
      const data = await apiClient<RequestResponseDto[]>('/requests/my-requests');
      return Array.isArray(data) ? data.map(toRequest) : [];
    } catch (error: any) {
      if (error?.status === 404) {
        try {
          const fallback = await apiClient<RequestResponseDto[]>('/requests');
          return Array.isArray(fallback) ? fallback.map(toRequest) : [];
        } catch {
          // Si el fallback también falla, dejamos que lance el error original
        }
      }
      throw error;
    }
  }
}
