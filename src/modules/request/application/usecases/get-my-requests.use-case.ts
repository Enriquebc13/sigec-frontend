import { Request } from '../../domain/entities/request.entity';
import { RequestRepository } from '../../domain/interfaces/request.repository';

export class GetMyRequestsUseCase {
  constructor(private readonly repository: RequestRepository) {}

  execute(): Promise<Request[]> {
    return this.repository.getMyRequests();
  }
}