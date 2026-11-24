import { RequestStatus } from '../domain/entities/request.entity';

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
};

/** Una solicitud rechazada por su propio dueño se muestra como "Cancelada". */
export const displayStatusLabel = (
  status: RequestStatus,
  cancelledByApplicant = false,
): string =>
  status === 'REJECTED' && cancelledByApplicant
    ? 'Cancelada'
    : REQUEST_STATUS_LABELS[status];

// Las acciones que no estén aquí se muestran tal cual llegan, así nada se rompe.
const ACTION_LABELS: Record<string, string> = {
  CREATED: 'Solicitud creada',
  APPROVED: 'Solicitud aprobada',
  REJECTED: 'Solicitud rechazada',
  UPDATED: 'Datos actualizados',
};

export const actionLabel = (action: string): string =>
  ACTION_LABELS[action] ?? action;
