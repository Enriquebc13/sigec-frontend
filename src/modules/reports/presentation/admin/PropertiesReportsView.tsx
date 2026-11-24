import { GradientScreen } from '@/components/ui/GradientScreen';
import { Property } from '@/modules/property/domain/entities/property.entity';
import { useProperties } from '@/modules/property/presentation/admin/hooks/use-properties';
import { AdminPropertyRequest } from '@/modules/request/domain/entities/request.entity';
import { useAdminRequests } from '@/modules/request/presentation/admin/hooks/use-admin-requests';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import ReportTabs from './components/ReportTabs';

const C = { white: '#FFFFFF', muted: '#C9BEDD', panel: 'rgba(255,255,255,0.09)', border: 'rgba(255,255,255,0.15)', green: '#86EFAC', red: '#FCA5A5' };
const STATUS = [
  { key: 'AVAILABLE', label: 'Disponibles' },
  { key: 'RESERVED', label: 'Reservadas' },
  { key: 'RENTED', label: 'Rentadas' },
  { key: 'UNAVAILABLE', label: 'No disponibles' },
] as const;
const typeLabel = (type: string) => ({ LOCAL: 'Local', OFFICE: 'Oficina', WAREHOUSE: 'Bodega' }[type] ?? type);
const money = (value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
const dateLabel = (value: Date) => Number.isNaN(value.getTime()) ? '—' : value.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

function exportWorkbook(filename: string, sheets: { name: string; rows: Record<string, unknown>[] }[]) {
  try {
    const book = XLSX.utils.book_new();
    sheets.forEach(({ name, rows }) => XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(rows), name.slice(0, 31)));
    if (Platform.OS === 'web') { XLSX.writeFile(book, filename, { bookType: 'xlsx' }); return; }
    const base64 = XLSX.write(book, { bookType: 'xlsx', type: 'base64' });
    if (!FileSystem.cacheDirectory) throw new Error('No se encontró el directorio temporal.');
    const uri = `${FileSystem.cacheDirectory}${filename}`;
    void FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 })
      .then(async () => {
        if (!(await Sharing.isAvailableAsync())) throw new Error('No está disponible compartir archivos en este dispositivo.');
        await Sharing.shareAsync(uri, { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', dialogTitle: 'Exportar reporte de propiedades' });
      }).catch((e) => Alert.alert('No se pudo exportar', e?.message ?? 'Intenta nuevamente.'));
  } catch (e: any) { Alert.alert('No se pudo exportar', e?.message ?? 'Error al generar Excel.'); }
}

function propertyRows(properties: Property[]) {
  return properties.map(p => ({ Propiedad: p.title, Tipo: typeLabel(p.type), Ciudad: p.address?.city ?? '—', Precio: money(p.price), Estado: STATUS.find(s => s.key === p.status)?.label ?? p.status }));
}
function rentedRows(properties: Property[], requests: AdminPropertyRequest[]) {
  return properties.filter(p => p.status === 'RENTED').map(property => {
    const approved = requests.filter(r => r.propertyId === property.id && r.status === 'APPROVED').sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    return {
      Propiedad: property.title,
      Tipo: typeLabel(property.type),
      Ciudad: property.address?.city ?? '—',
      Precio: money(property.price),
      'Rentada por': approved ? `${approved.applicant.name} ${approved.applicant.lastname}`.trim() : 'Sin solicitud aprobada disponible',
      Correo: approved?.applicant.email ?? '—',
      Teléfono: approved?.telefono ?? '—',
      'Solicitó el': approved ? dateLabel(approved.createdAt) : '—',
    };
  });
}

export default function PropertiesReportsView() {
  const { properties, loading: propertiesLoading, error: propertiesError, reload } = useProperties();
  const { requests, loading: requestsLoading, error: requestsError, refresh } = useAdminRequests();
  const [refreshing, setRefreshing] = useState(false);
  const loading = propertiesLoading || requestsLoading;
  const error = propertiesError || requestsError;
  const stats = useMemo(() => STATUS.map(status => ({ ...status, count: properties.filter(p => p.status === status.key).length })), [properties]);
  const total = properties.length;
  const rentals = useMemo(() => rentedRows(properties, requests), [properties, requests]);
  const inventoryExport = [
    ...stats.map(s => ({ Estado: s.label, Propiedades: s.count, Porcentaje: total ? `${(s.count / total * 100).toFixed(1)} %` : '0.0 %' })),
    { Estado: 'TOTAL', Propiedades: total, Porcentaje: total ? '100.0 %' : '0.0 %' },
  ];
  const allSheets = [
    { name: 'Inventario por estado', rows: inventoryExport },
    { name: 'Propiedades rentadas', rows: rentals },
  ];
  const exportAll = () => exportWorkbook('SIGEC_reporte_propiedades.xlsx', allSheets);
  const exportInventory = () => exportWorkbook('SIGEC_inventario_propiedades.xlsx', [allSheets[0]]);
  const exportRented = () => exportWorkbook('SIGEC_propiedades_rentadas.xlsx', [allSheets[1]]);
  const onRefresh = async () => { setRefreshing(true); await Promise.all([reload(), refresh()]); setRefreshing(false); };

  return (
    <GradientScreen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" colors={['#6846A8']} />}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerIcon}><AntDesign name="shop" size={23} color={C.white} /></View>
          <View style={{ flex: 1 }}><Text style={styles.title}>Reportes</Text><Text style={styles.subtitle}>Panel de administración SIGEC</Text></View>
          <Pressable onPress={onRefresh} style={styles.iconButton}><AntDesign name="reload" size={17} color={C.white} /></Pressable>
        </View>
        <ReportTabs active="properties" />
        <Pressable onPress={exportAll} style={styles.downloadAll}><AntDesign name="file-excel" size={19} color={C.white} /><Text style={styles.downloadText}>Descargar todo (Excel)</Text><AntDesign name="download" size={17} color={C.white} /></Pressable>
        <View style={styles.intro}><Text style={styles.introText}>Muestran la situación de hoy de tus propiedades.</Text></View>
        {loading && <ActivityIndicator color={C.white} size="large" style={{ marginVertical: 24 }} />}
        {!!error && <Text style={styles.error}>{error}</Text>}
        {!loading && !error && <>
          <View style={styles.sectionHeading}><View style={{ flex: 1 }}><Text style={styles.sectionTitle}>Inventario por estado</Text><Text style={styles.description}>Cuántas propiedades están disponibles, reservadas, rentadas y no disponibles.</Text></View><ExcelButton onPress={exportInventory} /></View>
          <View style={styles.metricRow}>
            {stats.map((s, i) => <Metric key={s.key} value={s.count} label={s.label} color={['#86EFAC', '#FCD34D', '#93C5FD', '#FCA5A5'][i]} />)}
            <Metric value={total} label="Total" color={C.white} />
          </View>
          <View style={styles.tableCard}><ScrollView horizontal showsHorizontalScrollIndicator><View>
            <View style={[styles.row, styles.tableHeader]}>{['Estado', 'Propiedades', 'Porcentaje'].map(x => <Text key={x} style={[styles.th, x === 'Estado' ? styles.statusCol : styles.numCol]}>{x}</Text>)}</View>
            {stats.map((s, i) => <View key={s.key} style={styles.row}><Text style={[styles.td, styles.statusCol]}>{s.label}</Text><Text style={[styles.td, styles.numCol]}>{s.count}</Text><Text style={[styles.td, styles.numCol]}>{total ? `${(s.count / total * 100).toFixed(1)} %` : '0.0 %'}</Text></View>)}
            <View style={[styles.row, styles.totalRow]}><Text style={[styles.td, styles.statusCol, styles.bold]}>TOTAL</Text><Text style={[styles.td, styles.numCol, styles.bold]}>{total}</Text><Text style={[styles.td, styles.numCol, styles.bold]}>{total ? '100.0 %' : '0.0 %'}</Text></View>
          </View></ScrollView></View>

          <View style={styles.sectionHeading}><View style={{ flex: 1 }}><Text style={styles.sectionTitle}>Propiedades rentadas</Text><Text style={styles.description}>Qué propiedades están rentadas y a quién, con sus datos de contacto.</Text></View><ExcelButton onPress={exportRented} /></View>
          <View style={styles.tableCard}><ScrollView horizontal showsHorizontalScrollIndicator><View>
            <View style={[styles.row, styles.tableHeader]}>{[{ t: 'Propiedad', w: 220 }, { t: 'Tipo', w: 100 }, { t: 'Ciudad', w: 110 }, { t: 'Precio', w: 120 }, { t: 'Rentada por', w: 190 }, { t: 'Correo', w: 210 }, { t: 'Teléfono', w: 125 }, { t: 'Solicitó el', w: 125 }].map(c => <Text key={c.t} style={[styles.th, { width: c.w }]}>{c.t}</Text>)}</View>
            {rentals.map((r, i) => <View key={`${r.Propiedad}-${i}`} style={styles.row}><Text style={[styles.td, styles.bold, { width: 220 }]}>{r.Propiedad}</Text><Text style={[styles.td, { width: 100 }]}>{r.Tipo}</Text><Text style={[styles.td, { width: 110 }]}>{r.Ciudad}</Text><Text style={[styles.td, { width: 120 }]}>{r.Precio}</Text><Text style={[styles.td, { width: 190 }]}>{r['Rentada por']}</Text><Text style={[styles.td, { width: 210 }]}>{r.Correo}</Text><Text style={[styles.td, { width: 125 }]}>{r.Teléfono}</Text><Text style={[styles.td, { width: 125 }]}>{r['Solicitó el']}</Text></View>)}
            {!rentals.length && <Text style={styles.empty}>No hay propiedades rentadas actualmente.</Text>}
          </View></ScrollView></View>
        </>}
      </View>
    </GradientScreen>
  );
}

function ExcelButton({ onPress }: { onPress: () => void }) { return <Pressable onPress={onPress} style={styles.excelButton}><AntDesign name="file-excel" size={16} color={C.green} /><Text style={styles.excelText}>Excel</Text></Pressable>; }
function Metric({ value, label, color }: { value: number; label: string; color: string }) { return <View style={styles.metric}><Text style={[styles.metricValue, { color }]}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>; }

const styles = StyleSheet.create({
  container: { gap: 17 }, header: { flexDirection: 'row', alignItems: 'center', gap: 12 }, headerIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(167,139,250,0.24)', alignItems: 'center', justifyContent: 'center' }, title: { color: C.white, fontSize: 23, fontWeight: '800' }, subtitle: { color: C.muted, fontSize: 13, marginTop: 3 }, iconButton: { width: 42, height: 42, borderRadius: 12, backgroundColor: C.panel, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  downloadAll: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, padding: 15, backgroundColor: '#6846A8', borderRadius: 13 }, downloadText: { color: C.white, fontSize: 15, fontWeight: '800' }, intro: { paddingHorizontal: 2 }, introText: { color: C.muted, fontSize: 13 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 7 }, sectionTitle: { color: C.white, fontSize: 19, fontWeight: '800' }, description: { color: C.muted, fontSize: 12, lineHeight: 17, marginTop: 4 }, excelButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(34,197,94,0.19)', borderWidth: 1, borderColor: 'rgba(134,239,172,0.3)', paddingHorizontal: 11, paddingVertical: 9, borderRadius: 10 }, excelText: { color: C.green, fontSize: 12, fontWeight: '800' },
  metricRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, metric: { flexGrow: 1, flexBasis: '17%', minWidth: 85, backgroundColor: C.panel, borderWidth: 1, borderColor: C.border, borderRadius: 13, paddingVertical: 13, paddingHorizontal: 7, alignItems: 'center', gap: 4 }, metricValue: { fontSize: 24, fontWeight: '900' }, metricLabel: { color: C.muted, fontSize: 10, textAlign: 'center', fontWeight: '600' },
  tableCard: { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: C.border, borderRadius: 13, overflow: 'hidden' }, row: { flexDirection: 'row', alignItems: 'center', minHeight: 46, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 12 }, tableHeader: { backgroundColor: 'rgba(255,255,255,0.09)', minHeight: 42 }, th: { color: '#D9CCF0', fontSize: 11, fontWeight: '800', paddingVertical: 10, paddingRight: 12 }, td: { color: '#F3EFFA', fontSize: 12, paddingVertical: 10, paddingRight: 12 }, statusCol: { width: 170 }, numCol: { width: 125, textAlign: 'center' }, totalRow: { backgroundColor: 'rgba(167,139,250,0.12)' }, bold: { fontWeight: '900' }, empty: { color: C.muted, padding: 16, fontSize: 12 }, error: { color: C.red, fontSize: 13, padding: 10 },
});
