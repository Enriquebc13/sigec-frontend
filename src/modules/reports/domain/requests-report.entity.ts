import { RequestStatus } from '@/modules/request/domain/entities/request.entity';

export type PropertyStatus = 'AVAILABLE' | 'RESERVED' | 'RENTED' | 'UNAVAILABLE';

/**
 * Grupos del reporte "Solicitudes por estado". "Cancelada" no es un estado de
 * la API: es una solicitud REJECTED que canceló el propio solicitante.
 */
export type RequestBucket = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export const BUCKET_ORDER: RequestBucket[] = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

export const BUCKET_LABELS: Record<RequestBucket, string> = {
  PENDING: 'Pendientes',
  APPROVED: 'Aprobadas',
  REJECTED: 'Rechazadas',
  CANCELLED: 'Canceladas',
};

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  AVAILABLE: 'Disponible',
  RESERVED: 'Reservada',
  RENTED: 'Rentada',
  UNAVAILABLE: 'No disponible',
};

export const propertyStatusLabel = (status: string) =>
  PROPERTY_STATUS_LABELS[status as PropertyStatus] ?? status;

export function bucketOf(status: RequestStatus, cancelledByApplicant: boolean): RequestBucket {
  if (status === 'REJECTED') return cancelledByApplicant ? 'CANCELLED' : 'REJECTED';
  return status;
}

export type BucketCounts = Record<RequestBucket, number>;
export const emptyCounts = (): BucketCounts => ({ PENDING: 0, APPROVED: 0, REJECTED: 0, CANCELLED: 0 });

export interface DateRange { from?: Date; to?: Date }

export interface StatusSummaryRow { bucket: RequestBucket; count: number; percentage: number }

export interface MonthlyRequestsRow extends BucketCounts { monthKey: string; label: string; total: number }

export interface PropertyDemandRow extends BucketCounts {
  propertyId: string;
  title: string;
  propertyStatus: string;
  total: number;
}

export interface WaitlistEntryRow {
  requestId: string;
  position: number;
  name: string;
  email: string;
  telefono: string;
  createdAt: Date;
}

export interface PropertyWaitlist {
  propertyId: string;
  title: string;
  propertyStatus: string;
  /** Texto del trato/renta actual ("Trato en curso con…", "Rentada a…"), si hay. */
  dealText: string | null;
  /** true si el estado de la propiedad y su solicitud aprobada no cuadran. */
  inconsistent: boolean;
  /** Datos de la solicitud aprobada (para contactarla por WhatsApp). */
  approved: { name: string; telefono: string; requestId: string } | null;
  entries: WaitlistEntryRow[];
}

export interface RequestsReportBundle {
  byStatus: StatusSummaryRow[];
  byMonth: MonthlyRequestsRow[];
  demand: PropertyDemandRow[];
  waitlists: PropertyWaitlist[];
  /** Ej. "01/11/2026 – 30/11/2026" */
  rangeLabel: string;
}

export type RequestsReportSheet = 'byStatus' | 'byMonth' | 'demand' | 'waitlists';
export const ALL_REQUEST_SHEETS: RequestsReportSheet[] = ['byStatus', 'byMonth', 'demand', 'waitlists'];
