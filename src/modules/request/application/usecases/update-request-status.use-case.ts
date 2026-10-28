import { Request, RequestStatus } from '../../domain/entities/request.entity';
import { RequestRepository } from '../../domain/interfaces/request.repository';

export class UpdateRequestStatusUseCase {
  constructor(private readonly repository: RequestRepository) {}

  execute(id: string, status: RequestStatus): Promise<Request> {
    return this.repository.updateStatus(id, status);
  }
}
