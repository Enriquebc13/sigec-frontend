import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export type ChipOption<T extends string> = {
  label: string;
  value: T;
  /** Cuántas propiedades quedarían al elegir esta opción. */
  count?: number;
};

type Props<T extends string> = {
  title: string;
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Una fila de chips con scroll horizontal (Estado, Tipo...). */
export function PropertyFilterChips<T extends string>({
  title,
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <View style={styles.group}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        keyboardShouldPersistTaps="handled"
      >
        {options.map((opt) => {
          const selected = value === opt.value;
          // Sin resultados: se atenúa, pero se puede elegir igual
          const empty = !selected && opt.count === 0;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={[styles.chip, selected && styles.chipActive, empty && styles.chipEmpty]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                {opt.label}
                {opt.count !== undefined ? ` (${opt.count})` : ''}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { marginBottom: 12 },
  title: { fontSize: 12, color: '#AFA3C8', marginBottom: 6, fontWeight: '600' },
  row: { gap: 8, paddingRight: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  chipActive: { backgroundColor: '#5E35B1', borderColor: '#7C4DFF' },
  chipEmpty: { opacity: 0.45 },
  chipText: { fontSize: 13, color: '#D0C6E5', fontWeight: '500' },
  chipTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
});
