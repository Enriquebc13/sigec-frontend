import { apiClient } from '@/core/http/api-client';
import { RequestHistoryResponseDto } from '../../application/dtos/request-history-response.dto';
import { RequestHistory } from '../../domain/entities/request-history.entity';
import { RequestHistoryRepository } from '../../domain/interfaces/request-history.repository';

function toRequestHistory(dto: RequestHistoryResponseDto): RequestHistory {
  const authorName = `${dto.user?.name ?? ''} ${dto.user?.lastname ?? ''}`.trim();
  return {
    id: dto.id,
    action: dto.action,
    changedAt: new Date(dto.changedAt),
    requestId: dto.requestId,
    userId: dto.userId,
    authorName: authorName || dto.user?.email || 'Usuario desconocido',
  };
}

export class RequestHistoryApiRepository implements RequestHistoryRepository {
  async findAll(): Promise<RequestHistory[]> {
    const data = await apiClient<RequestHistoryResponseDto[]>('/requests/history');
    return (data ?? []).map(toRequestHistory);
  }
}
