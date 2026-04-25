import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, TextInput, Alert } from 'react-native';
import { TIME_SLOTS } from '../demoData';

const P = '#E91E8C';

const DATES = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i + 1);
  return { label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), iso: d.toISOString() };
});

export default function BookingScreen({ route, navigation }: any) {
  const { provider, service } = route.params;
  const [selectedDate, setSelectedDate] = useState(DATES[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedTime) { Alert.alert('Please select a time slot'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    Alert.alert(
      '🎉 Booking Confirmed!',
      `Your appointment with ${provider.name} for ${service.name} on ${selectedDate.label} at ${selectedTime} is confirmed.`,
      [{ text: 'View Bookings', onPress: () => navigation.navigate('Bookings') }, { text: 'Done', onPress: () => navigation.navigate('Home') }]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ backgroundColor: '#fff', padding: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={{ color: P, fontSize: 15, fontWeight: '600' }}>← Back</Text>
          </Pressable>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#1A1A2E', marginTop: 12 }}>Book Appointment</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: '#FFF0F7', borderRadius: 14, padding: 14 }}>
            <Text style={{ fontSize: 32, marginRight: 12 }}>{provider.emoji}</Text>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1A1A2E' }}>{provider.name}</Text>
              <Text style={{ color: P, fontWeight: '600', marginTop: 2 }}>{service.name}</Text>
              <Text style={{ color: '#8E8E93', fontSize: 13, marginTop: 1 }}>{service.durationMins} mins · ${service.price}</Text>
            </View>
          </View>
        </View>

        <View style={{ padding: 20 }}>
          {/* Date */}
          <Text style={s.sec}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 10 }}>
            {DATES.map(d => (
              <Pressable key={d.iso} onPress={() => setSelectedDate(d)} style={[s.dateChip, selectedDate.iso === d.iso && s.dateChipActive]}>
                <Text style={[s.dateText, selectedDate.iso === d.iso && s.dateTextActive]}>{d.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Time */}
          <Text style={[s.sec, { marginTop: 24 }]}>Select Time</Text>
          <View style={s.timeGrid}>
            {TIME_SLOTS.map(t => (
              <Pressable key={t} onPress={() => setSelectedTime(t)} style={[s.timeChip, selectedTime === t && s.timeChipActive]}>
                <Text style={[s.timeText, selectedTime === t && s.timeTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          {/* Notes */}
          <Text style={[s.sec, { marginTop: 24 }]}>Notes (optional)</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Any requests or special instructions..."
            placeholderTextColor="#aaa"
            multiline
            numberOfLines={3}
            style={s.notesInput}
          />

          {/* Summary */}
          {selectedTime ? (
            <View style={s.summary}>
              <Text style={s.summaryTitle}>Booking Summary</Text>
              <View style={s.summaryRow}><Text style={s.summaryLabel}>Service</Text><Text style={s.summaryVal}>{service.name}</Text></View>
              <View style={s.summaryRow}><Text style={s.summaryLabel}>Date</Text><Text style={s.summaryVal}>{selectedDate.label}</Text></View>
              <View style={s.summaryRow}><Text style={s.summaryLabel}>Time</Text><Text style={s.summaryVal}>{selectedTime}</Text></View>
              <View style={s.summaryRow}><Text style={s.summaryLabel}>Duration</Text><Text style={s.summaryVal}>{service.durationMins} mins</Text></View>
              <View style={[s.summaryRow, { borderBottomWidth: 0 }]}><Text style={[s.summaryLabel, { fontWeight: '700' }]}>Total</Text><Text style={[s.summaryVal, { fontWeight: '700', color: P }]}>${service.price}</Text></View>
            </View>
          ) : null}

          <View style={{ height: 30 }} />
        </View>
      </ScrollView>

      <View style={{ backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#F0F0F0' }}>
        <Pressable onPress={handleConfirm} style={[s.cta, !selectedTime && { backgroundColor: '#ddd' }]} disabled={!selectedTime || loading}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{loading ? 'Confirming…' : `Confirm Booking · $${service.price}`}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  sec: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 12 },
  dateChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: '#fff', marginRight: 8, borderWidth: 1, borderColor: '#E8E8E8' },
  dateChipActive: { backgroundColor: P, borderColor: P },
  dateText: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },
  dateTextActive: { color: '#fff', fontWeight: '700' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E8E8E8' },
  timeChipActive: { backgroundColor: P, borderColor: P },
  timeText: { fontSize: 13, color: '#555', fontWeight: '500' },
  timeTextActive: { color: '#fff', fontWeight: '700' },
  notesInput: { backgroundColor: '#fff', borderRadius: 14, padding: 14, fontSize: 14, color: '#1A1A2E', borderWidth: 1, borderColor: '#E8E8E8', minHeight: 80, textAlignVertical: 'top' },
  summary: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  summaryTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A2E', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  summaryLabel: { color: '#8E8E93', fontSize: 14 },
  summaryVal: { color: '#1A1A2E', fontSize: 14 },
  cta: { backgroundColor: P, borderRadius: 16, padding: 16, alignItems: 'center' },
});
