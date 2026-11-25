import { PropertyRequest, RequestStatus } from '../../domain/entities/request.entity';
import { RequestRepository } from '../../domain/interfaces/request.repository';

export class CancelRequestUseCase {
  constructor(private readonly repository: RequestRepository) {}

  execute(id: string, status: RequestStatus): Promise<PropertyRequest> {
    // Una aprobada tiene la propiedad reservada: se cancela con el administrador
    if (status !== 'PENDING') {
      throw new Error(
        'Solo puedes cancelar solicitudes pendientes. Si ya fue aprobada, contacta al administrador',
      );
    }
    return this.repository.cancel(id);
  }
}
