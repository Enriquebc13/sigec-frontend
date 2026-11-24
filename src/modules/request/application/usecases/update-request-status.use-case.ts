import {
  DecisionStatus,
  PropertyRequest,
} from '../../domain/entities/request.entity';
import { RequestRepository } from '../../domain/interfaces/request.repository';

export class UpdateRequestStatusUseCase {
  constructor(private readonly repository: RequestRepository) {}

  execute(requestId: string, status: DecisionStatus): Promise<PropertyRequest> {
    if (!requestId) {
      throw new Error('No se pudo identificar la solicitud');
    }
    // Misma regla que el @IsIn del UpdateRequestStatusDto de la API
    if (status !== 'APPROVED' && status !== 'REJECTED') {
      throw new Error('El status debe ser APPROVED o REJECTED');
    }
    return this.repository.updateStatus(requestId, { status });
  }
}
