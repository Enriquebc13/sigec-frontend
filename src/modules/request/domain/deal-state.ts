import { AdminPropertyRequest } from './entities/request.entity';

/**
 * Estado del "trato" de una propiedad, deducido de DOS fuentes que deben
 * coincidir: el estado de la propiedad y su solicitud APPROVED (si la hay).
 *
 * - IN_PROGRESS: propiedad RESERVED + solicitud aprobada (trato en curso).
 * - RENTED: propiedad RENTED + solicitud aprobada (rentada a esa persona).
 * - RENTED_NO_REQUEST: propiedad RENTED sin solicitud aprobada (dato incoherente,
 *   p. ej. se marcó como rentada a mano).
 * - APPROVED_NOT_RESERVED: hay solicitud aprobada pero la propiedad no está
 *   RESERVED ni RENTED (dato incoherente).
 * - NONE: sin trato.
 */
export type DealKind =
  | 'NONE'
  | 'IN_PROGRESS'
  | 'RENTED'
  | 'RENTED_NO_REQUEST'
  | 'APPROVED_NOT_RESERVED';

export interface DealState {
  kind: DealKind;
  /** Solicitud aprobada asociada, si existe. */
  request: AdminPropertyRequest | null;
  /** true si estado de propiedad y solicitud no cuadran. */
  inconsistent: boolean;
}

export function getDealState(
  propertyStatus: string,
  approved: AdminPropertyRequest | null,
): DealState {
  if (approved) {
    if (propertyStatus === 'RENTED') return { kind: 'RENTED', request: approved, inconsistent: false };
    if (propertyStatus === 'RESERVED') return { kind: 'IN_PROGRESS', request: approved, inconsistent: false };
    return { kind: 'APPROVED_NOT_RESERVED', request: approved, inconsistent: true };
  }
  if (propertyStatus === 'RENTED') return { kind: 'RENTED_NO_REQUEST', request: null, inconsistent: true };
  return { kind: 'NONE', request: null, inconsistent: false };
}

const fullName = (r: AdminPropertyRequest) =>
  `${r.applicant.name} ${r.applicant.lastname}`.trim();

/** Texto corto para chips/filas: "Trato en curso con X" o "Rentada a X". */
export function dealLabel(state: DealState): string | null {
  switch (state.kind) {
    case 'IN_PROGRESS':
      return `Trato en curso con ${fullName(state.request!)}`;
    case 'RENTED':
      return `Rentada a ${fullName(state.request!)}`;
    case 'APPROVED_NOT_RESERVED':
      return `Solicitud aprobada de ${fullName(state.request!)} (revisa el estado de la propiedad)`;
    case 'RENTED_NO_REQUEST':
      return 'Rentada (sin solicitud aprobada registrada)';
    default:
      return null;
  }
}
