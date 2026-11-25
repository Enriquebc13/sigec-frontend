import { PropertyRequest, RequestStatus } from '../../domain/entities/request.entity';
import { RequestRepository } from '../../domain/interfaces/request.repository';

// "243 895 3612" o "(243) 895-3612" → "2438953612"
export const normalizePhone = (value: string) => value.replace(/[\s()-]/g, '');

export class UpdateRequestPhoneUseCase {
  constructor(private readonly repository: RequestRepository) {}

  execute(id: string, status: RequestStatus, telefono: string): Promise<PropertyRequest> {
    if (status === 'REJECTED') {
      throw new Error('No puedes editar el teléfono de una solicitud rechazada o cancelada');
    }
    const normalized = normalizePhone(telefono);
    // Misma regla que al crear la solicitud
    if (!/^\d{10}$/.test(normalized)) {
      throw new Error('Ingresa un número de teléfono de 10 dígitos');
    }
    return this.repository.updatePhone(id, normalized);
  }
}
