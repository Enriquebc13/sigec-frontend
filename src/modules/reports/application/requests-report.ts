import { Property } from '@/modules/property/domain/entities/property.entity';
import { dealLabel, getDealState } from '@/modules/request/domain/deal-state';
import { AdminPropertyRequest } from '@/modules/request/domain/entities/request.entity';
import {
  BUCKET_ORDER,
  bucketOf,
  DateRange,
  emptyCounts,
  MonthlyRequestsRow,
  PropertyDemandRow,
  PropertyWaitlist,
  StatusSummaryRow,
} from '../domain/requests-report.entity';

/* ------------------------------ fechas dd/mm/aaaa ------------------------------ */

/** Deja solo dígitos y mete las diagonales mientras se escribe: "01112026" → "01/11/2026". */
export function maskDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** "dd/mm/aaaa" → Date local (00:00) o null si está vacío/incompleto/inexistente. */
export function parseDmy(value: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const [d, m, y] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(y, m - 1, d);
  const valid = date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  return valid && y >= 2000 ? date : null;
}

export interface RangeResult { range: DateRange; error: string | null }

/** Valida los dos textos y arma el rango (de 00:00 a 23:59:59.999). */
export function buildRange(fromText: string, toText: string): RangeResult {
  const from = parseDmy(fromText);
  const to = parseDmy(toText);
  if (fromText && fromText.length === 10 && !from) return { range: {}, error: 'La fecha «Solicitadas desde» no es válida.' };
  if (toText && toText.length === 10 && !to) return { range: {}, error: 'La fecha «Hasta» no es válida.' };
  if (from && to && from > to) return { range: {}, error: 'La fecha inicial no puede ser mayor que la final.' };
  return {
    range: {
      from: from ?? undefined,
      to: to ? new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999) : undefined,
    },
    error: null,
  };
}

export function describeRange(fromText: string, toText: string): string {
  const from = parseDmy(fromText) ? fromText : '';
  const to = parseDmy(toText) ? toText : '';
  if (!from && !to) return 'Todas las fechas';
  if (from && to) return `${from} – ${to}`;
  return from ? `Desde ${from}` : `Hasta ${to}`;
}

const isInRange = (date: Date, range: DateRange) => {
  if (Number.isNaN(date.getTime())) return false;
  if (range.from && date < range.from) return false;
  if (range.to && date > range.to) return false;
  return true;
};

/* ----------------------------------- reportes ----------------------------------- */

const fullName = (r: AdminPropertyRequest) => `${r.applicant.name} ${r.applicant.lastname}`.trim();

/** Reporte 1: solicitudes por estado (por fecha de solicitud). */
export function buildByStatus(requests: AdminPropertyRequest[], range: DateRange): StatusSummaryRow[] {
  const counts = emptyCounts();
  let total = 0;
  for (const r of requests) {
    if (!isInRange(r.createdAt, range)) continue;
    counts[bucketOf(r.status, r.cancelledByApplicant)] += 1;
    total += 1;
  }
  return BUCKET_ORDER.map((bucket) => ({
    bucket,
    count: counts[bucket],
    percentage: total === 0 ? 0 : (counts[bucket] / total) * 100,
  }));
}

const MAX_MONTHS = 600;
const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const monthLabel = (d: Date) => {
  const text = d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/** Reporte 2: solicitudes por mes, con el estado actual de cada una. */
export function buildByMonth(requests: AdminPropertyRequest[], range: DateRange): MonthlyRequestsRow[] {
  const inRange = requests.filter((r) => isInRange(r.createdAt, range));
  if (inRange.length === 0 && !(range.from && range.to)) return [];

  const times = inRange.map((r) => r.createdAt.getTime());
  const start = range.from ?? new Date(Math.min(...times));
  const end = range.to ?? new Date(Math.max(...times));

  const byMonth = new Map<string, ReturnType<typeof emptyCounts>>();
  for (const r of inRange) {
    const key = monthKey(r.createdAt);
    const counts = byMonth.get(key) ?? emptyCounts();
    counts[bucketOf(r.status, r.cancelledByApplicant)] += 1;
    byMonth.set(key, counts);
  }

  const rows: MonthlyRequestsRow[] = [];
  let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cursor <= last && rows.length < MAX_MONTHS) {
    const counts = byMonth.get(monthKey(cursor)) ?? emptyCounts();
    rows.push({
      monthKey: monthKey(cursor),
      label: monthLabel(cursor),
      ...counts,
      total: counts.PENDING + counts.APPROVED + counts.REJECTED + counts.CANCELLED,
    });
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }
  return rows;
}

/** Reporte 3: demanda por propiedad (incluye las de 0 solicitudes). */
export function buildDemand(
  requests: AdminPropertyRequest[],
  properties: Property[],
  range: DateRange,
): PropertyDemandRow[] {
  const counts = new Map<string, ReturnType<typeof emptyCounts>>();
  for (const r of requests) {
    if (!isInRange(r.createdAt, range)) continue;
    const current = counts.get(r.propertyId) ?? emptyCounts();
    current[bucketOf(r.status, r.cancelledByApplicant)] += 1;
    counts.set(r.propertyId, current);
  }
  return properties
    .map((p) => {
      const c = counts.get(p.id) ?? emptyCounts();
      return {
        propertyId: p.id,
        title: p.title,
        propertyStatus: p.status,
        ...c,
        total: c.PENDING + c.APPROVED + c.REJECTED + c.CANCELLED,
      };
    })
    .sort((a, b) => b.total - a.total || a.title.localeCompare(b.title, 'es'));
}

/**
 * Reporte 4: listas de espera ACTUALES (no dependen de las fechas). Solo salen
 * propiedades con alguien esperando o con trato/renta vigente.
 */
export function buildWaitlists(
  requests: AdminPropertyRequest[],
  properties: Property[],
  propertyId?: string,
): PropertyWaitlist[] {
  const groups: PropertyWaitlist[] = [];

  for (const property of properties) {
    if (propertyId && property.id !== propertyId) continue;

    const ofProperty = requests.filter((r) => r.propertyId === property.id);
    const pending = ofProperty
      .filter((r) => r.status === 'PENDING')
      .sort(
        (a, b) =>
          (a.posicionListaEspera ?? Number.MAX_SAFE_INTEGER) - (b.posicionListaEspera ?? Number.MAX_SAFE_INTEGER) ||
          a.createdAt.getTime() - b.createdAt.getTime(),
      );
    const approved = ofProperty.find((r) => r.status === 'APPROVED') ?? null;
    const deal = getDealState(property.status, approved);

    if (pending.length === 0 && deal.kind === 'NONE') continue;

    groups.push({
      propertyId: property.id,
      title: property.title,
      propertyStatus: property.status,
      dealText: dealLabel(deal),
      inconsistent: deal.inconsistent,
      approved: approved
        ? { name: fullName(approved), telefono: approved.telefono, requestId: approved.id }
        : null,
      entries: pending.map((r, index) => ({
        requestId: r.id,
        position: r.posicionListaEspera ?? index + 1,
        name: fullName(r),
        email: r.applicant.email,
        telefono: r.telefono,
        createdAt: r.createdAt,
      })),
    });
  }

  return groups.sort((a, b) => b.entries.length - a.entries.length || a.title.localeCompare(b.title, 'es'));
}
