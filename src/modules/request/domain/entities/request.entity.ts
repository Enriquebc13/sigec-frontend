/**
 * Estados reales de la API. La lista de espera NO es un estado: se deduce de
 * status === 'PENDING' + posicionListaEspera.
 */
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/** Estados que un admin puede asignar (PENDING lo pone el sistema al crear). */
export type DecisionStatus = 'APPROVED' | 'REJECTED';

export interface PropertyRequest {
  id: string;
  telefono: string;
  userId: string;
  propertyId: string;
  status: RequestStatus;
  createdAt: Date;
  /** Lugar en la lista de espera (1 = primero). Solo existe mientras está PENDING. */
  posicionListaEspera: number | null;
  /** true si la solicitud está REJECTED porque el propio solicitante la canceló. */
  cancelledByApplicant: boolean;
}

/** Persona que envió la solicitud (solo la ve el admin). */
export interface RequestApplicant {
  id: string;
  name: string;
  lastname: string;
  email: string;
}

/** Solicitud tal como la ve el admin: con solicitante y propiedad. */
export interface AdminPropertyRequest extends PropertyRequest {
  applicant: RequestApplicant;
  property: { id: string; title: string; status: string };
}

/**
 * Decisiones que la API permite desde cada estado:
 * - PENDING  → aprobar o rechazar
 * - APPROVED → solo rechazar (el trato se cayó)
 * - REJECTED → ninguna (no se reabre)
 */
export function allowedDecisions(status: RequestStatus): DecisionStatus[] {
  switch (status) {
    case 'PENDING':
      return ['APPROVED', 'REJECTED'];
    case 'APPROVED':
      return ['REJECTED'];
    default:
      return [];
  }
}
