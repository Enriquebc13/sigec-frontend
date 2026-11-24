import { RequestStatus } from '../../domain/entities/request.entity';

/** Respuesta de POST /requests y GET /requests/my-requests. */
export interface RequestResponseDto {
  id: string;
  telefono: string;
  userId: string;
  propertyId: string;
  status: RequestStatus;
  createdAt: string;
  /** Número si la solicitud está PENDING; null o ausente si ya fue resuelta. */
  posicionListaEspera?: number | null;
  /** true si el propio solicitante canceló la solicitud. */
  cancelledByApplicant?: boolean;
}
