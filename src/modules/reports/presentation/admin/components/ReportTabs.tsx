import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type ReportTab = 'users' | 'properties' | 'requests';

const tabs: { key: ReportTab; label: string; route: string; icon: keyof typeof AntDesign.glyphMap }[] = [
  { key: 'users', label: 'Usuarios', route: '/(admin)/reports-users', icon: 'team' },
  { key: 'properties', label: 'Propiedades', route: '/(admin)/reports-properties', icon: 'shop' },
  { key: 'requests', label: 'Solicitudes', route: '/(admin)/reports-requests', icon: 'file-text' },
];

export default function ReportTabs({ active }: { active: ReportTab }) {
  const router = useRouter();
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const selected = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => { if (!selected) router.replace(tab.route as never); }}
            style={[styles.tab, selected && styles.selected]}
          >
            <AntDesign name={tab.icon} size={15} color={selected ? '#FFFFFF' : '#C9BEDD'} />
            <Text numberOfLines={1} style={[styles.label, selected && styles.selectedLabel]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 7, padding: 5, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  tab: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, paddingHorizontal: 5, borderRadius: 9 },
  selected: { backgroundColor: '#6846A8' },
  label: { color: '#C9BEDD', fontSize: 11, fontWeight: '700' },
  selectedLabel: { color: '#FFFFFF' },
});
