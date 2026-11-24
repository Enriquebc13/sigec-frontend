/** Un evento del historial de una solicitud (creada, aprobada, rechazada...). */
export interface RequestHistory {
  id: string;
  action: string;
  changedAt: Date;
  requestId: string;
  /** Quién realizó la acción (un admin, o el propio solicitante si canceló). */
  userId: string;
  authorName: string;
}
