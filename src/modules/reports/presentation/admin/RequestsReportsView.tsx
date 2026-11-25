import { GradientScreen } from '@/components/ui/GradientScreen';
import { useProperties } from '@/modules/property/presentation/admin/hooks/use-properties';
import {
  goToAdminProperty,
  goToPropertyRequests,
} from '@/modules/property/presentation/property-navigation';
import { useAdminRequests } from '@/modules/request/presentation/admin/hooks/use-admin-requests';
import { buildContactMessage, isWhatsAppReachable, openWhatsApp } from '@/modules/request/presentation/admin/whatsapp';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  buildByMonth,
  buildByStatus,
  buildDemand,
  buildRange,
  buildWaitlists,
  describeRange,
  maskDateInput,
} from '../../application/requests-report';
import {
  ALL_REQUEST_SHEETS,
  BUCKET_LABELS,
  propertyStatusLabel,
  RequestsReportBundle,
  RequestsReportSheet,
} from '../../domain/requests-report.entity';
import { exportWorkbook } from '../../infrastructure/excel-export';
import { buildRequestsSheets } from '../../infrastructure/requests-report-sheets';
import ReportTabs from './components/ReportTabs';

const C = {
  white: '#FFFFFF', muted: '#C9BEDD', panel: 'rgba(255,255,255,0.09)', border: 'rgba(255,255,255,0.15)',
  green: '#86EFAC', red: '#FCA5A5', amber: '#FCD34D', blue: '#93C5FD', purple: '#C4B5FD',
};
const BUCKET_COLORS = [C.amber, C.green, C.red, C.blue];
const dmy = (d: Date) => (Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }));

export default function RequestsReportsView() {
  const { requests, loading: requestsLoading, error: requestsError, refresh: refreshRequests } = useAdminRequests();
  const { properties, loading: propertiesLoading, error: propertiesError, reload: reloadProperties } = useProperties();

  const [fromText, setFromText] = useState('');
  const [toText, setToText] = useState('');
  const [waitlistPropertyId, setWaitlistPropertyId] = useState(''); // '' = todas
  const [exporting, setExporting] = useState<RequestsReportSheet | 'all' | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loading = requestsLoading || propertiesLoading;
  const error = requestsError ?? propertiesError;

  // Con un rango inválido no se filtra por fecha y se bloquean las descargas
  const { range, error: rangeError } = useMemo(() => buildRange(fromText, toText), [fromText, toText]);

  const byStatus = useMemo(() => buildByStatus(requests, range), [requests, range]);
  const byMonth = useMemo(() => buildByMonth(requests, range), [requests, range]);
  const demand = useMemo(() => buildDemand(requests, properties, range), [requests, properties, range]);
  const waitlists = useMemo(
    () => buildWaitlists(requests, properties, waitlistPropertyId || undefined),
    [requests, properties, waitlistPropertyId],
  );

  const total = byStatus.reduce((s, r) => s + r.count, 0);
  const maxMonthly = Math.max(1, ...byMonth.map((m) => m.total));
  const maxDemand = Math.max(1, ...demand.map((d) => d.total));
  const waitingTotal = waitlists.reduce((s, g) => s + g.entries.length, 0);

  const bundle: RequestsReportBundle = {
    byStatus, byMonth, demand, waitlists, rangeLabel: describeRange(fromText, toText),
  };

  const download = async (sheets: RequestsReportSheet[]) => {
    if (rangeError || exporting) return;
    const isAll = sheets.length === ALL_REQUEST_SHEETS.length;
    setExporting(isAll ? 'all' : sheets[0]);
    const file = isAll ? 'SIGEC_reporte_solicitudes.xlsx' : `SIGEC_solicitudes_${sheets[0]}.xlsx`;
    await exportWorkbook(file, buildRequestsSheets(bundle, sheets), 'Exportar reporte de solicitudes');
    setExporting(null);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshRequests(), reloadProperties()]);
    setRefreshing(false);
  };

  const emptyPeriod = 'No hay solicitudes en el periodo elegido.';
  const showData = !loading && !error;

  return (
    <GradientScreen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" colors={['#6846A8']} />}>
      <View style={s.container}>
        <View style={s.header}>
          <View style={s.headerIcon}><AntDesign name="file-text" size={23} color={C.white} /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Reportes</Text>
            <Text style={s.subtitle}>Reportes de solicitudes</Text>
          </View>
          <Pressable onPress={onRefresh} style={s.iconButton} accessibilityLabel="Actualizar"><AntDesign name="reload" size={17} color={C.white} /></Pressable>
        </View>

        <ReportTabs active="requests" />

        <Pressable
          onPress={() => download(ALL_REQUEST_SHEETS)}
          disabled={loading || !!error || !!rangeError || exporting !== null}
          style={[s.downloadAll, (loading || !!error || !!rangeError || exporting !== null) && s.disabled]}
        >
          <AntDesign name="file-excel" size={19} color={C.white} />
          <Text style={s.downloadText}>{exporting === 'all' ? 'Generando...' : 'Descargar todo (Excel)'}</Text>
          <AntDesign name="download" size={17} color={C.white} />
        </Pressable>

        {/* Filtro de fechas: aplica a los reportes 1, 2 y 3 (fecha de la solicitud) */}
        <View style={s.filterCard}>
          <View style={s.dateFields}>
            <View style={s.dateField}>
              <Text style={s.fieldLabel}>Solicitadas desde</Text>
              <TextInput
                value={fromText}
                onChangeText={(t) => setFromText(maskDateInput(t))}
                placeholder="dd/mm/aaaa"
                placeholderTextColor="#A99DBB"
                keyboardType="number-pad"
                maxLength={10}
                style={s.dateInput}
              />
            </View>
            <View style={s.dateField}>
              <Text style={s.fieldLabel}>Hasta</Text>
              <TextInput
                value={toText}
                onChangeText={(t) => setToText(maskDateInput(t))}
                placeholder="dd/mm/aaaa"
                placeholderTextColor="#A99DBB"
                keyboardType="number-pad"
                maxLength={10}
                style={s.dateInput}
              />
            </View>
          </View>
          <Pressable
            onPress={() => { setFromText(''); setToText(''); }}
            disabled={!fromText && !toText}
            style={[s.clearButton, !fromText && !toText && s.disabled]}
          >
            <AntDesign name="close-circle" size={14} color={C.muted} />
            <Text style={s.clearText}>Limpiar fechas</Text>
          </Pressable>
          <Text style={s.hint}>
            Las fechas aplican a los primeros tres reportes. Las listas de espera muestran siempre la situación de hoy.
          </Text>
          {!!rangeError && <Text style={s.errorText}>{rangeError}</Text>}
        </View>

        {loading && <ActivityIndicator color={C.white} size="large" style={{ marginVertical: 24 }} />}
        {!loading && !!error && (
          <View style={s.errorCard}>
            <Text style={s.errorText}>{error}</Text>
            <Pressable onPress={onRefresh} style={s.retry}><Text style={s.retryText}>Reintentar</Text></Pressable>
          </View>
        )}

        {showData && <>
          {/* ---------- 1. Solicitudes por estado ---------- */}
          <Heading
            title="Solicitudes por estado"
            description="Cuántas solicitudes están pendientes, aprobadas, rechazadas y canceladas por el propio cliente."
            onExport={() => download(['byStatus'])}
            busy={exporting === 'byStatus'}
            disabled={!!rangeError || exporting !== null}
          />
          <View style={s.metricRow}>
            {byStatus.map((r, i) => <Metric key={r.bucket} value={r.count} label={BUCKET_LABELS[r.bucket]} color={BUCKET_COLORS[i]} />)}
            <Metric value={total} label="Total" color={C.white} />
          </View>
          {total === 0 ? <Text style={s.empty}>{emptyPeriod}</Text> : (
            <View style={s.tableCard}><ScrollView horizontal><View>
              <View style={[s.row, s.tableHeader]}>
                <Text style={[s.th, { width: 130 }]}>Estado</Text>
                <Text style={[s.th, s.num]}>Solicitudes</Text>
                <Text style={[s.th, { width: 110 }]}>{''}</Text>
                <Text style={[s.th, s.num]}>Porcentaje</Text>
              </View>
              {byStatus.map((r) => (
                <View key={r.bucket} style={s.row}>
                  <Text style={[s.td, { width: 130 }]}>{BUCKET_LABELS[r.bucket]}</Text>
                  <Text style={[s.td, s.num]}>{r.count}</Text>
                  <Bar ratio={r.percentage / 100} />
                  <Text style={[s.td, s.num]}>{r.percentage.toFixed(1)} %</Text>
                </View>
              ))}
            </View></ScrollView></View>
          )}

          {/* ---------- 2. Solicitudes por mes ---------- */}
          <Heading
            title="Solicitudes por mes"
            description="Cuántas solicitudes llegaron cada mes y en qué estado están hoy."
            onExport={() => download(['byMonth'])}
            busy={exporting === 'byMonth'}
            disabled={!!rangeError || byMonth.length === 0 || exporting !== null}
          />
          {byMonth.length === 0 ? <Text style={s.empty}>{emptyPeriod}</Text> : (
            <View style={s.tableCard}><ScrollView horizontal><View>
              <View style={[s.row, s.tableHeader]}>
                <Text style={[s.th, { width: 150 }]}>Mes</Text>
                <Text style={[s.th, s.num]}>Total</Text>
                <Text style={[s.th, { width: 110 }]}>{''}</Text>
                {['Pendientes', 'Aprobadas', 'Rechazadas', 'Canceladas'].map((h) => <Text key={h} style={[s.th, s.num]}>{h}</Text>)}
              </View>
              {byMonth.map((m) => (
                <View key={m.monthKey} style={s.row}>
                  <Text style={[s.td, s.bold, { width: 150 }]}>{m.label}</Text>
                  <Text style={[s.td, s.num]}>{m.total}</Text>
                  <Bar ratio={m.total / maxMonthly} />
                  <Text style={[s.td, s.num]}>{m.PENDING}</Text>
                  <Text style={[s.td, s.num]}>{m.APPROVED}</Text>
                  <Text style={[s.td, s.num]}>{m.REJECTED}</Text>
                  <Text style={[s.td, s.num]}>{m.CANCELLED}</Text>
                </View>
              ))}
            </View></ScrollView></View>
          )}

          {/* ---------- 3. Demanda por propiedad ---------- */}
          <Heading
            title="Demanda por propiedad"
            description="Cuántas solicitudes ha recibido cada propiedad y cuántas siguen en espera. Las propiedades sin solicitudes aparecen con 0. Toca una propiedad para ver sus solicitudes."
            onExport={() => download(['demand'])}
            busy={exporting === 'demand'}
            disabled={!!rangeError || demand.length === 0 || exporting !== null}
          />
          {demand.length === 0 ? <Text style={s.empty}>Todavía no hay propiedades registradas.</Text> : (
            <View style={s.tableCard}><ScrollView horizontal><View>
              <View style={[s.row, s.tableHeader]}>
                <Text style={[s.th, { width: 200 }]}>Propiedad</Text>
                <Text style={[s.th, { width: 110 }]}>Estado</Text>
                <Text style={[s.th, s.num]}>Solicitudes</Text>
                <Text style={[s.th, { width: 110 }]}>{''}</Text>
                {['En espera', 'Aprobadas', 'Rechazadas', 'Canceladas'].map((h) => <Text key={h} style={[s.th, s.num]}>{h}</Text>)}
              </View>
              {demand.map((d) => (
                <View key={d.propertyId} style={s.row}>
                  <Pressable style={{ width: 200 }} onPress={() => goToPropertyRequests(d.propertyId)}>
                    <Text style={[s.td, s.bold, s.link]} numberOfLines={2}>{d.title}</Text>
                  </Pressable>
                  <Text style={[s.td, { width: 110 }]}>{propertyStatusLabel(d.propertyStatus)}</Text>
                  <Text style={[s.td, s.num]}>{d.total}</Text>
                  <Bar ratio={d.total / maxDemand} />
                  <Text style={[s.td, s.num]}>{d.PENDING}</Text>
                  <Text style={[s.td, s.num]}>{d.APPROVED}</Text>
                  <Text style={[s.td, s.num]}>{d.REJECTED}</Text>
                  <Text style={[s.td, s.num]}>{d.CANCELLED}</Text>
                </View>
              ))}
            </View></ScrollView></View>
          )}

          {/* ---------- 4. Listas de espera actuales ---------- */}
          <Heading
            title="Listas de espera actuales"
            description="Por propiedad, quién va en cada puesto con su teléfono y fecha de solicitud, para poder contactarlos."
            onExport={() => download(['waitlists'])}
            busy={exporting === 'waitlists'}
            disabled={waitlists.length === 0 || exporting !== null}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
            <Chip label="Todas" selected={!waitlistPropertyId} onPress={() => setWaitlistPropertyId('')} />
            {properties.map((p) => (
              <Chip key={p.id} label={p.title} selected={waitlistPropertyId === p.id} onPress={() => setWaitlistPropertyId(p.id)} />
            ))}
          </ScrollView>
          <Text style={s.count}>{waitingTotal} {waitingTotal === 1 ? 'persona' : 'personas'} en espera</Text>

          {waitlists.length === 0 ? (
            <Text style={s.empty}>No hay listas de espera activas ni tratos en curso.</Text>
          ) : waitlists.map((g) => (
            <View key={g.propertyId} style={s.group}>
              <View style={s.groupHead}>
                <Text style={s.groupTitle} numberOfLines={2}>{g.title}</Text>
                <Text style={s.tag}>{propertyStatusLabel(g.propertyStatus)}</Text>
              </View>
              <Text style={s.muted}>{g.entries.length} en espera</Text>

              {g.dealText && (
                <View style={[s.deal, g.inconsistent && s.dealWarn]}>
                  <Text style={[s.dealText, g.inconsistent && s.dealTextWarn]}>
                    {g.propertyStatus === 'RENTED' ? '🏠' : g.inconsistent ? '⚠️' : '🤝'} {g.dealText}
                  </Text>
                  {g.approved && isWhatsAppReachable(g.approved.telefono) && (
                    <WhatsAppButton
                      label={g.approved.telefono}
                      onPress={() => openWhatsApp(g.approved!.telefono, buildContactMessage({ applicant: g.approved!.name, propertyTitle: g.title, status: 'APPROVED' }))}
                    />
                  )}
                </View>
              )}

              {g.entries.length === 0 ? <Text style={s.muted}>Nadie más está en espera.</Text> : g.entries.map((e) => (
                <View key={e.requestId} style={s.entry}>
                  <Text style={s.position}>#{e.position}</Text>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={s.entryName}>{e.name}</Text>
                    <Text style={s.entryMeta} numberOfLines={1}>{e.email}</Text>
                    <Text style={s.entryMeta}>Solicitó el {dmy(e.createdAt)}</Text>
                  </View>
                  {isWhatsAppReachable(e.telefono)
                    ? <WhatsAppButton
                        label={e.telefono}
                        onPress={() => openWhatsApp(e.telefono, buildContactMessage({ applicant: e.name, propertyTitle: g.title, status: 'PENDING', position: e.position }))}
                      />
                    : <Text style={s.entryMeta}>{e.telefono}</Text>}
                </View>
              ))}

              <View style={s.groupActions}>
                <Pressable style={s.groupBtn} onPress={() => goToAdminProperty(g.propertyId)}><Text style={s.groupBtnText}>Ver propiedad</Text></Pressable>
                <Pressable style={s.groupBtn} onPress={() => goToPropertyRequests(g.propertyId)}><Text style={s.groupBtnText}>Solicitudes recibidas</Text></Pressable>
              </View>
            </View>
          ))}
        </>}
      </View>
    </GradientScreen>
  );
}

function Heading({ title, description, onExport, busy, disabled }: { title: string; description: string; onExport: () => void; busy: boolean; disabled: boolean }) {
  return (
    <View style={s.sectionHeading}>
      <View style={{ flex: 1 }}><Text style={s.sectionTitle}>{title}</Text><Text style={s.description}>{description}</Text></View>
      <Pressable onPress={onExport} disabled={disabled} style={[s.excelButton, disabled && s.disabled]}>
        <AntDesign name="file-excel" size={16} color={C.green} />
        <Text style={s.excelText}>{busy ? '...' : 'Excel'}</Text>
      </Pressable>
    </View>
  );
}
function Metric({ value, label, color }: { value: number; label: string; color: string }) {
  return <View style={s.metric}><Text style={[s.metricValue, { color }]}>{value}</Text><Text style={s.metricLabel}>{label}</Text></View>;
}
function Bar({ ratio }: { ratio: number }) {
  return <View style={s.barCell}><View style={s.bar}><View style={[s.barFill, { width: `${Math.max(0, Math.min(1, ratio)) * 100}%` }]} /></View></View>;
}
function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[s.chip, selected && s.chipSelected]}><Text style={[s.chipText, selected && s.chipTextSelected]} numberOfLines={1}>{label}</Text></Pressable>;
}
function WhatsAppButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={s.wa} accessibilityLabel={`Escribir por WhatsApp a ${label}`}>
      <AntDesign name="message" size={14} color={C.green} />
      <Text style={s.waText}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  container: { gap: 17 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(167,139,250,0.24)', alignItems: 'center', justifyContent: 'center' },
  title: { color: C.white, fontSize: 23, fontWeight: '800' },
  subtitle: { color: C.muted, fontSize: 13, marginTop: 3 },
  iconButton: { width: 42, height: 42, borderRadius: 12, backgroundColor: C.panel, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  downloadAll: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, padding: 15, backgroundColor: '#6846A8', borderRadius: 13 },
  downloadText: { color: C.white, fontSize: 15, fontWeight: '800' },
  disabled: { opacity: 0.45 },
  filterCard: { backgroundColor: C.panel, borderColor: C.border, borderWidth: 1, borderRadius: 15, padding: 15, gap: 10 },
  dateFields: { flexDirection: 'row', gap: 10 },
  dateField: { flex: 1, gap: 6 },
  fieldLabel: { color: C.muted, fontSize: 12, fontWeight: '700' },
  dateInput: { color: C.white, backgroundColor: 'rgba(0,0,0,0.22)', borderWidth: 1, borderColor: C.border, borderRadius: 9, paddingHorizontal: 11, paddingVertical: 10, fontSize: 13 },
  clearButton: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-end' },
  clearText: { color: C.muted, fontSize: 12 },
  hint: { color: C.muted, fontSize: 12, lineHeight: 17 },
  errorText: { color: C.red, fontSize: 12 },
  errorCard: { backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)', borderRadius: 14, padding: 14, alignItems: 'center', gap: 10 },
  retry: { backgroundColor: '#EF4444', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  retryText: { color: C.white, fontWeight: 'bold', fontSize: 13 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 7 },
  sectionTitle: { color: C.white, fontSize: 19, fontWeight: '800' },
  description: { color: C.muted, fontSize: 12, lineHeight: 17, marginTop: 4 },
  excelButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(34,197,94,0.19)', borderWidth: 1, borderColor: 'rgba(134,239,172,0.3)', paddingHorizontal: 11, paddingVertical: 9, borderRadius: 10 },
  excelText: { color: C.green, fontSize: 12, fontWeight: '800' },
  metricRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metric: { flexGrow: 1, flexBasis: '17%', minWidth: 85, backgroundColor: C.panel, borderWidth: 1, borderColor: C.border, borderRadius: 13, paddingVertical: 13, paddingHorizontal: 7, alignItems: 'center', gap: 4 },
  metricValue: { fontSize: 24, fontWeight: '900' },
  metricLabel: { color: C.muted, fontSize: 10, textAlign: 'center', fontWeight: '600' },
  tableCard: { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: C.border, borderRadius: 13, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 46, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 12 },
  tableHeader: { backgroundColor: 'rgba(255,255,255,0.09)', minHeight: 42 },
  th: { color: '#D9CCF0', fontSize: 11, fontWeight: '800', paddingVertical: 10, paddingRight: 12 },
  td: { color: '#F3EFFA', fontSize: 12, paddingVertical: 10, paddingRight: 12 },
  num: { width: 95, textAlign: 'center' },
  bold: { fontWeight: '900' },
  link: { textDecorationLine: 'underline', textDecorationColor: 'rgba(196,181,253,0.5)' },
  barCell: { width: 110, paddingRight: 12 },
  bar: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, backgroundColor: '#8B5CF6' },
  empty: { color: C.muted, fontSize: 12, textAlign: 'center', paddingVertical: 14 },
  chipRow: { gap: 8, paddingRight: 8 },
  chip: { maxWidth: 220, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: 'rgba(0,0,0,0.15)' },
  chipSelected: { backgroundColor: '#6846A8', borderColor: '#A78BFA' },
  chipText: { color: C.muted, fontSize: 12, fontWeight: '700' },
  chipTextSelected: { color: C.white },
  count: { color: C.muted, fontSize: 12, fontWeight: '700' },
  group: { backgroundColor: C.panel, borderWidth: 1, borderColor: C.border, borderRadius: 15, padding: 14, gap: 10 },
  groupHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  groupTitle: { flex: 1, color: C.white, fontSize: 16, fontWeight: '800' },
  tag: { color: C.purple, backgroundColor: 'rgba(139,92,246,0.2)', fontSize: 11, fontWeight: '800', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' },
  muted: { color: C.muted, fontSize: 12 },
  deal: { backgroundColor: 'rgba(139,92,246,0.16)', borderRadius: 10, padding: 10, gap: 8 },
  dealWarn: { backgroundColor: 'rgba(245,158,11,0.15)' },
  dealText: { color: '#E4DAFF', fontSize: 13, fontWeight: '700' },
  dealTextWarn: { color: C.amber },
  entry: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.12)' },
  position: { color: C.amber, fontSize: 15, fontWeight: '900', width: 34 },
  entryName: { color: C.white, fontSize: 13, fontWeight: '700' },
  entryMeta: { color: C.muted, fontSize: 11 },
  wa: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(34,197,94,0.19)', borderWidth: 1, borderColor: 'rgba(134,239,172,0.3)', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, alignSelf: 'flex-start' },
  waText: { color: C.green, fontSize: 12, fontWeight: '800' },
  groupActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  groupBtn: { flex: 1, minHeight: 40, borderRadius: 10, backgroundColor: 'rgba(139,92,246,0.25)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  groupBtnText: { color: '#C7B5FF', fontWeight: 'bold', fontSize: 12, textAlign: 'center' },
});
