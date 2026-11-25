import {
  BUCKET_LABELS,
  propertyStatusLabel,
  RequestsReportBundle,
  RequestsReportSheet,
} from '../domain/requests-report.entity';
import { ExportSheet } from './excel-export';

const dmy = (d: Date) =>
  Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });

/** Mismas hojas y columnas que el Excel de la web. */
export function buildRequestsSheets(bundle: RequestsReportBundle, which: RequestsReportSheet[]): ExportSheet[] {
  const sheets: ExportSheet[] = [];

  if (which.includes('byStatus')) {
    const total = bundle.byStatus.reduce((s, r) => s + r.count, 0);
    sheets.push({
      name: 'Solicitudes por estado',
      rows: [
        ...bundle.byStatus.map((r) => ({
          Estado: BUCKET_LABELS[r.bucket],
          Solicitudes: r.count,
          Porcentaje: `${r.percentage.toFixed(1)} %`,
        })),
        { Estado: 'Total', Solicitudes: total, Porcentaje: total ? '100.0 %' : '0.0 %' },
      ],
    });
  }

  if (which.includes('byMonth')) {
    sheets.push({
      name: 'Solicitudes por mes',
      rows: bundle.byMonth.map((m) => ({
        Mes: m.label,
        Total: m.total,
        Pendientes: m.PENDING,
        Aprobadas: m.APPROVED,
        Rechazadas: m.REJECTED,
        Canceladas: m.CANCELLED,
      })),
    });
  }

  if (which.includes('demand')) {
    sheets.push({
      name: 'Demanda por propiedad',
      rows: bundle.demand.map((d) => ({
        Propiedad: d.title,
        'Estado actual': propertyStatusLabel(d.propertyStatus),
        Solicitudes: d.total,
        'En espera': d.PENDING,
        Aprobadas: d.APPROVED,
        Rechazadas: d.REJECTED,
        Canceladas: d.CANCELLED,
      })),
    });
  }

  if (which.includes('waitlists')) {
    const rows: Record<string, unknown>[] = [];
    for (const g of bundle.waitlists) {
      const base = { Propiedad: g.title, 'Estado propiedad': propertyStatusLabel(g.propertyStatus) };
      if (g.approved) {
        rows.push({
          ...base,
          Puesto: g.propertyStatus === 'RENTED' ? 'Rentada' : 'Trato en curso',
          Nombre: g.approved.name,
          Correo: '',
          Teléfono: g.approved.telefono,
          'Solicitó el': '',
        });
      }
      for (const e of g.entries) {
        rows.push({ ...base, Puesto: e.position, Nombre: e.name, Correo: e.email, Teléfono: e.telefono, 'Solicitó el': dmy(e.createdAt) });
      }
    }
    sheets.push({ name: 'Listas de espera', rows });
  }

  sheets.push({
    name: 'Información',
    rows: [
      { Dato: 'Reporte', Valor: 'Solicitudes · SIGEC' },
      { Dato: 'Generado el', Valor: new Date().toLocaleString('es-MX') },
      { Dato: 'Rango (fecha de solicitud)', Valor: bundle.rangeLabel },
      { Dato: 'Nota', Valor: 'Las listas de espera son la situación actual y no dependen del rango.' },
    ],
  });
  return sheets;
}
