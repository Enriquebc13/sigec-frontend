import { PropertyRequest } from '../domain/entities/request.entity';

export type RequestFilter =
  | 'ALL'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export const REQUEST_FILTER_OPTIONS: { label: string; value: RequestFilter }[] = [
  { label: 'Todas', value: 'ALL' },
  { label: 'Pendientes', value: 'PENDING' },
  { label: 'Aprobadas', value: 'APPROVED' },
  { label: 'Rechazadas', value: 'REJECTED' },
  { label: 'Canceladas', value: 'CANCELLED' },
];

/**
 * La API no tiene un estado "cancelada": es una solicitud REJECTED con
 * cancelledByApplicant. Por eso "Rechazadas" las excluye y "Canceladas" las agrupa.
 */
export function matchesRequestFilter(
  request: Pick<PropertyRequest, 'status' | 'cancelledByApplicant'>,
  filter: RequestFilter,
): boolean {
  switch (filter) {
    case 'ALL':
      return true;
    case 'CANCELLED':
      return request.status === 'REJECTED' && request.cancelledByApplicant;
    case 'REJECTED':
      return request.status === 'REJECTED' && !request.cancelledByApplicant;
    default:
      return request.status === filter;
  }
}

// Minúsculas y sin acentos: "José" coincide con "jose"
export const normalizeText = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
