import { RequestRepository } from '../../domain/interfaces/request.repository';

export class DeleteRequestUseCase {
  constructor(private readonly repository: RequestRepository) {}

  execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
