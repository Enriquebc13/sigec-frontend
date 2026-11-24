import { RequestHistory } from '../../domain/entities/request-history.entity';
import { RequestHistoryRepository } from '../../domain/interfaces/request-history.repository';

export class GetRequestHistoryUseCase {
  constructor(private readonly repository: RequestHistoryRepository) {}

  execute(): Promise<RequestHistory[]> {
    return this.repository.findAll();
  }
}
