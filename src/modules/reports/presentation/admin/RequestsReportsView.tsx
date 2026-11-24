import { GradientScreen } from '@/components/ui/GradientScreen';
import AntDesign from '@expo/vector-icons/AntDesign';
import { StyleSheet, Text, View } from 'react-native';
import ReportTabs from './components/ReportTabs';

export default function RequestsReportsView() {
  return (
    <GradientScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.icon}><AntDesign name="bar-chart" size={23} color="#FFFFFF" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Reportes</Text>
            <Text style={styles.subtitle}>Panel de administración SIGEC</Text>
          </View>
        </View>
        <ReportTabs active="requests" />
        <View style={styles.card}>
          <AntDesign name="file-text" size={30} color="#C4B5FD" />
          <Text style={styles.cardTitle}>Reportes de solicitudes</Text>
          <Text style={styles.description}>Esta pestaña ya está integrada en el módulo de Administración - Reportes. El análisis de solicitudes, demanda por propiedad y listas de espera se incorporará en la siguiente etapa.</Text>
        </View>
      </View>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: { gap: 17 }, header: { flexDirection: 'row', alignItems: 'center', gap: 12 }, icon: { width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(167,139,250,0.24)', alignItems: 'center', justifyContent: 'center' }, title: { color: '#FFFFFF', fontSize: 23, fontWeight: '800' }, subtitle: { color: '#C9BEDD', fontSize: 13, marginTop: 3 }, card: { marginTop: 8, padding: 22, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.09)', alignItems: 'center', gap: 12 }, cardTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', textAlign: 'center' }, description: { color: '#C9BEDD', fontSize: 13, lineHeight: 20, textAlign: 'center' },
});
