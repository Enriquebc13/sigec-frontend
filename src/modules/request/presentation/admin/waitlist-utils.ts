import { AdminPropertyRequest } from '../../domain/entities/request.entity';

/** Estado de las solicitudes de una propiedad. */
export interface PropertyQueue {
  /** Lista de espera: PENDING, del puesto 1 en adelante. */
  pending: AdminPropertyRequest[];
  /** Solicitud aprobada (trato en curso), si existe. */
  approved: AdminPropertyRequest | null;
  rejectedCount: number;
  /** De las rechazadas, cuántas canceló el propio solicitante. */
  cancelledCount: number;
}

export const emptyQueue = (): PropertyQueue => ({
  pending: [],
  approved: null,
  rejectedCount: 0,
  cancelledCount: 0,
});

/** Agrupa las solicitudes por propiedad y ordena cada fila por su puesto. */
export function buildQueues(
  requests: AdminPropertyRequest[],
): Map<string, PropertyQueue> {
  const queues = new Map<string, PropertyQueue>();

  for (const request of requests) {
    const queue = queues.get(request.propertyId) ?? emptyQueue();
    if (request.status === 'PENDING') queue.pending.push(request);
    else if (request.status === 'APPROVED') queue.approved = request;
    else {
      queue.rejectedCount += 1;
      if (request.cancelledByApplicant) queue.cancelledCount += 1;
    }
    queues.set(request.propertyId, queue);
  }

  for (const queue of queues.values()) {
    queue.pending.sort(
      (a, b) =>
        (a.posicionListaEspera ?? Number.MAX_SAFE_INTEGER) -
          (b.posicionListaEspera ?? Number.MAX_SAFE_INTEGER) ||
        a.createdAt.getTime() - b.createdAt.getTime(),
    );
  }

  return queues;
}
