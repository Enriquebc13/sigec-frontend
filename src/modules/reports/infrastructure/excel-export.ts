import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import * as XLSX from 'xlsx';

export type ExportSheet = { name: string; rows: Record<string, unknown>[] };

/**
 * Genera un .xlsx y lo descarga (web) o abre el menú de compartir (iOS/Android).
 * Mismo mecanismo que usan los reportes de Usuarios y Propiedades.
 */
export async function exportWorkbook(filename: string, sheets: ExportSheet[], dialogTitle: string) {
  try {
    const book = XLSX.utils.book_new();
    sheets.forEach(({ name, rows }) =>
      XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(rows), name.slice(0, 31)),
    );

    if (Platform.OS === 'web') {
      XLSX.writeFile(book, filename, { bookType: 'xlsx' });
      return;
    }

    const base64 = XLSX.write(book, { bookType: 'xlsx', type: 'base64' });
    if (!FileSystem.cacheDirectory) throw new Error('No se encontró el directorio temporal.');
    const uri = `${FileSystem.cacheDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
    if (!(await Sharing.isAvailableAsync())) {
      throw new Error('No está disponible compartir archivos en este dispositivo.');
    }
    await Sharing.shareAsync(uri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle,
      UTI: 'org.openxmlformats.spreadsheetml.sheet',
    });
  } catch (e: any) {
    Alert.alert('No se pudo exportar', e?.message ?? 'Ocurrió un error al generar el Excel.');
  }
}
