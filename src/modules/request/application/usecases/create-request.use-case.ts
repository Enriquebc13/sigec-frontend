import { PropertyRequest } from '../../domain/entities/request.entity';
import { RequestRepository } from '../../domain/interfaces/request.repository';
import { CreateRequestDto } from '../dtos/create-request.dto';

// "243 895 3612" o "(243) 895-3612" → "2438953612"
const normalizePhone = (value: string) => value.replace(/[\s()-]/g, '');

export class CreateRequestUseCase {
  constructor(private readonly repository: RequestRepository) {}

  execute(dto: CreateRequestDto): Promise<PropertyRequest> {
    const telefono = normalizePhone(dto.telefono);

    // Misma regla que la web: teléfono de 10 dígitos
    if (!/^\d{10}$/.test(telefono)) {
      throw new Error('Ingresa un número de teléfono de 10 dígitos');
    }
    if (!dto.propertyId) {
      throw new Error('No se pudo identificar la propiedad');
    }

    return this.repository.create({ telefono, propertyId: dto.propertyId });
  }
}
