/** Respuesta de GET /requests/history (solo los campos que usa el móvil). */
export interface RequestHistoryResponseDto {
  id: string;
  action: string;
  changedAt: string;
  requestId: string;
  userId: string;
  user?: { name?: string; lastname?: string; email?: string };
}
