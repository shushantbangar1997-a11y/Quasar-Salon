import React from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  SafeAreaView, StatusBar,
} from 'react-native';
import { COLORS, RADIUS } from '../theme';
import { CartItem } from '../CartContext';
import { StaffMember } from '../quasarData';

export default function BookingSuccessScreen({ route, navigation }: any) {
  const { services, date, time, stylist, total }: {
    services: CartItem[];
    date: string;
    time: string;
    stylist: StaffMember | null;
    total: number;
  } = route.params;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center', paddingBottom: 60 }}>

        {/* Success icon */}
        <View style={s.successCircle}>
          <Text style={{ fontSize: 48 }}>✓</Text>
        </View>
        <Text style={s.headline}>Booking Confirmed!</Text>
        <Text style={s.sub}>Your luxury appointment has been scheduled</Text>

        {/* Booking card */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardHeaderText}>Appointment Details</Text>
          </View>

          <View style={s.row}>
            <Text style={s.rowLabel}>📅 Date</Text>
            <Text style={s.rowValue}>{date}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.rowLabel}>🕐 Time</Text>
            <Text style={s.rowValue}>{time}</Text>
          </View>
          {stylist && (
            <View style={s.row}>
              <Text style={s.rowLabel}>{stylist.emoji} Stylist</Text>
              <Text style={s.rowValue}>{stylist.name}</Text>
            </View>
          )}

          <View style={s.divider} />

          <Text style={s.svcHeader}>Services</Text>
          {services.map(item => (
            <View key={item.service.id} style={s.svcRow}>
              <Text style={s.svcName} numberOfLines={2}>{item.service.name}</Text>
              <Text style={s.svcPrice}>₹{(item.service.price * item.qty).toLocaleString('en-IN')}</Text>
            </View>
          ))}

          <View style={s.divider} />

          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total Paid</Text>
            <Text style={s.totalValue}>₹{total.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <Text style={s.note}>We'll confirm your appointment shortly. See you at Quasar Salon!</Text>

        <Pressable style={s.primaryBtn} onPress={() => navigation.navigate('Bookings')}>
          <Text style={s.primaryBtnText}>View My Bookings</Text>
        </Pressable>
        <Pressable style={s.secondaryBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={s.secondaryBtnText}>Back to Home</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  successCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primaryDim, borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 20 },
  headline: { fontSize: 28, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  sub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 28 },
  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, width: '100%', borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  cardHeader: { backgroundColor: COLORS.primaryDim, padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  cardHeaderText: { fontSize: 14, fontWeight: '700', color: COLORS.primary, letterSpacing: 0.5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowLabel: { fontSize: 14, color: COLORS.textSecondary },
  rowValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  svcHeader: { fontSize: 13, color: COLORS.textMuted, padding: 14, paddingBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  svcRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 8 },
  svcName: { fontSize: 13, color: COLORS.text, flex: 1, marginRight: 10 },
  svcPrice: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 14 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  totalValue: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  note: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginTop: 24, marginBottom: 8, lineHeight: 20 },
  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: 16, alignItems: 'center', width: '100%', marginTop: 16 },
  primaryBtnText: { color: COLORS.bg, fontWeight: '800', fontSize: 15 },
  secondaryBtn: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: 16, alignItems: 'center', width: '100%', marginTop: 12 },
  secondaryBtnText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 15 },
});
