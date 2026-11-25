import { CreateRequestDto } from '../../application/dtos/create-request.dto';
import { UpdateRequestStatusDto } from '../../application/dtos/update-request-status.dto';
import { AdminPropertyRequest, PropertyRequest, RequestStatus } from '../entities/request.entity';

/** Filtros opcionales del listado de administrador. */
export interface RequestFilters {
  propertyId?: string;
  status?: RequestStatus;
}

export interface RequestRepository {
  /** POST /requests: el userId lo saca la API del token. */
  create(dto: CreateRequestDto): Promise<PropertyRequest>;
  /** PATCH /requests/:id/status (solo ADMIN): la API guarda al admin como autor en el historial. */
  updateStatus(id: string, dto: UpdateRequestStatusDto): Promise<PropertyRequest>;
  /** GET /requests/my-requests: solicitudes del usuario autenticado. */
  findMine(): Promise<PropertyRequest[]>;
  /** GET /requests (solo ADMIN): con solicitante y propiedad. */
  findAll(filters?: RequestFilters): Promise<AdminPropertyRequest[]>;
  /** PATCH /requests/:id/cancel: el solicitante cancela su solicitud PENDING (sale de la lista de espera). */
  cancel(id: string): Promise<PropertyRequest>;
  /** PATCH /requests/:id/phone: el solicitante corrige su teléfono (PENDING o APPROVED). */
  updatePhone(id: string, telefono: string): Promise<PropertyRequest>;
  /** DELETE /requests/:id: elimina una solicitud propia. */
  delete(id: string): Promise<void>;
}
