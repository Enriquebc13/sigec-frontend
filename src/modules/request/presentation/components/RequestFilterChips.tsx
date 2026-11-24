import { Pressable, StyleSheet, Text, View } from 'react-native';
import { REQUEST_FILTER_OPTIONS, RequestFilter } from '../request-filters';

type Props = {
  value: RequestFilter;
  onChange: (value: RequestFilter) => void;
};

export function RequestFilterChips({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {REQUEST_FILTER_OPTIONS.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.chip, isSelected && styles.chipActive]}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  chipActive: {
    backgroundColor: '#5E35B1',
    borderColor: '#7C4DFF',
  },
  chipText: {
    fontSize: 13,
    color: '#D0C6E5',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
