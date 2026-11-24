import { PropertyRequest } from '../../domain/entities/request.entity';
import { RequestRepository } from '../../domain/interfaces/request.repository';

export class GetMyRequestsUseCase {
  constructor(private readonly repository: RequestRepository) {}

  async execute(): Promise<PropertyRequest[]> {
    const requests = await this.repository.findMine();
    // Las más recientes primero
    return [...requests].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }
}
