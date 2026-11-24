import { AdminPropertyRequest } from '../../domain/entities/request.entity';
import {
  RequestFilters,
  RequestRepository,
} from '../../domain/interfaces/request.repository';

export class GetAdminRequestsUseCase {
  constructor(private readonly repository: RequestRepository) {}

  async execute(filters: RequestFilters = {}): Promise<AdminPropertyRequest[]> {
    const requests = await this.repository.findAll(filters);
    // Las más recientes primero
    return [...requests].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }
}
