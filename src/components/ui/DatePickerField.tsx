
import DateTimePicker, {
    DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function parseDate(value: string): Date {
  if (!value) return new Date();

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) return new Date();

  const [, year, month, day] = match;

  return new Date(Number(year), Number(month) - 1, Number(day));
}

function formatISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDisplay(value: string): string {
  if (!value) return 'Seleccionar fecha';

  const date = parseDate(value);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export default function DatePickerField({
  label,
  value,
  onChange,
}: DatePickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  const selectedDate = parseDate(value);

  const handleChange = (event: any, date?: Date) => {
    if (event.type === 'set' && date) {
      onChange(formatISO(date));
    }

    setShowPicker(false);
  };

  const openPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: selectedDate,
        mode: 'date',
        display: 'calendar',
        onChange: handleChange,
      });
    } else {
      setShowPicker(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        style={styles.dateButton}
        onPress={openPicker}
      >
        <Text style={styles.dateText}>
          {formatDisplay(value)}
        </Text>
        <Text style={styles.icon}>📅</Text>
      </Pressable>

      {Platform.OS === 'ios' && showPicker && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="compact"
            onChange={handleChange}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 7,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  dateButton: {
    minHeight: 46,
    backgroundColor: '#1D1A27',
    borderWidth: 1,
    borderColor: '#44365D',
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  icon: {
    fontSize: 17,
  },
  pickerContainer: {
    alignItems: 'flex-start',
    marginTop: 5,
  },
});
