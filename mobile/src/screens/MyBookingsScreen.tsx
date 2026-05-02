import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { useBookings, ConfirmedBooking } from '../BookingsContext';
import { useCart } from '../CartContext';
import { COLORS, RADIUS } from '../theme';
import { MyBookingsScreenProps } from '../navigation';

const STATUS: Record<string, { bg: string; label: string; color: string }> = {
  confirmed: { bg: COLORS.successBg, label: '✓ Confirmed', color: COLORS.success },
  pending: { bg: '#FFF8E1', label: '⏳ Pending', color: '#B8860B' },
  completed: { bg: COLORS.bgElevated, label: '✅ Completed', color: COLORS.textSecondary },
  cancelled: { bg: COLORS.errorBg, label: '✗ Cancelled', color: COLORS.error },
};

export default function MyBookingsScreen({ navigation }: MyBookingsScreenProps) {
  const { bookings, cancelBooking } = useBookings();
  const { totalItems, replaceCart } = useCart();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const upcoming = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const past = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');
  const list = tab === 'upcoming' ? upcoming : past;

  const handleCancel = (b: ConfirmedBooking) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel your appointment on ${b.date} at ${b.time}? This cannot be undone.`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(b.id);
            try {
              await cancelBooking(b.id);
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Failed to cancel booking';
              Alert.alert('Error', message);
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  const handleReschedule = (b: ConfirmedBooking) => {
    const proceed = () => {
      replaceCart(
        b.services,
        b.guests?.map(g => ({ name: g.name, items: g.services }))
      );
      navigation.navigate('Booking', {
        reschedule: {
          bookingId: b.id,
          stylist: b.stylist ?? undefined,
          dateIso: b.dateIso,
          timeSlot: b.time,
          services: b.services,
          guests: b.guests,
        },
      });
    };

    if (totalItems > 0) {
      Alert.alert(
        'Replace cart?',
        'Your current cart will be replaced with the services from this booking.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Replace', style: 'destructive', onPress: proceed },
        ]
      );
      return;
    }
    proceed();
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <Text style={s.title}>My Bookings</Text>
        <View style={s.tabs}>
          <Pressable onPress={() => setTab('upcoming')} style={[s.tab, tab === 'upcoming' && s.tabActive]}>
            <Text style={[s.tabText, tab === 'upcoming' && s.tabTextActive]}>Upcoming ({upcoming.length})</Text>
          </Pressable>
          <Pressable onPress={() => setTab('past')} style={[s.tab, tab === 'past' && s.tabActive]}>
            <Text style={[s.tabText, tab === 'past' && s.tabTextActive]}>Past ({past.length})</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
        {list.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 52 }}>📅</Text>
            <Text style={s.emptyTitle}>No {tab} bookings</Text>
            <Text style={s.emptyText}>Browse our services and book your first appointment</Text>
            <Pressable style={s.emptyBtn} onPress={() => navigation.navigate('Home')}>
              <Text style={s.emptyBtnText}>Book Now</Text>
            </Pressable>
          </View>
        ) : (
          list.map((b: ConfirmedBooking) => {
            const sc = STATUS[b.status] || STATUS.pending;
            const isCancelling = cancellingId === b.id;
            const isUpcoming = b.status === 'confirmed' || b.status === 'pending';
            return (
              <View key={b.id} style={s.card}>
                {/* Card top */}
                <View style={s.cardTop}>
                  <View style={s.stylistEmoji}>
                    <Text style={{ fontSize: 26 }}>{b.stylist?.emoji || '✨'}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.stylistName}>{b.stylist?.name || 'Quasar Stylist'}</Text>
                    <Text style={s.serviceCount}>{b.services.length} service{b.services.length > 1 ? 's' : ''}</Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[s.statusText, { color: sc.color }]}>{sc.label}</Text>
                  </View>
                </View>

                {/* Services / Guests */}
                <View style={s.servicesBox}>
                  {b.guests && b.guests.length > 0 ? (
                    b.guests.map((g, gi) => (
                      <View key={gi} style={{ marginBottom: 6 }}>
                        <Text style={s.guestLabel}>{g.name}</Text>
                        {g.services.map((item, i) => (
                          <Text key={i} style={s.svcItem}>
                            · {item.qty > 1 ? `${item.qty}× ` : ''}{item.service.name}
                          </Text>
                        ))}
                      </View>
                    ))
                  ) : (
                    b.services.map((item, i) => (
                      <Text key={i} style={s.svcItem}>
                        · {item.qty > 1 ? `${item.qty}× ` : ''}{item.service.name}
                      </Text>
                    ))
                  )}
                </View>

                <View style={s.divider} />

                {/* Meta row */}
                <View style={s.metaRow}>
                  <Text style={s.meta}>📅 {b.date}</Text>
                  <Text style={s.meta}>🕐 {b.time}</Text>
                  <Text style={[s.meta, { color: COLORS.primary, fontWeight: '700' }]}>
                    ₹{b.total.toLocaleString('en-IN')}
                  </Text>
                </View>

                {/* Actions */}
                {isUpcoming && (
                  <View style={s.actionsRow}>
                    <Pressable
                      style={[s.rescheduleBtn, isCancelling && s.btnDisabled]}
                      onPress={() => handleReschedule(b)}
                      disabled={isCancelling}
                    >
                      <Text style={s.rescheduleText}>Reschedule</Text>
                    </Pressable>
                    <Pressable
                      style={[s.cancelBtn, isCancelling && s.btnDisabled]}
                      onPress={() => handleCancel(b)}
                      disabled={isCancelling}
                    >
                      {isCancelling ? (
                        <ActivityIndicator size="small" color={COLORS.error} />
                      ) : (
                        <Text style={s.cancelText}>Cancel</Text>
                      )}
                    </Pressable>
                  </View>
                )}
                {b.status === 'completed' && (
                  <Pressable style={s.rebookBtn} onPress={() => navigation.navigate('Home')}>
                    <Text style={s.rebookText}>Book Again</Text>
                  </Pressable>
                )}
              </View>
            );
          })
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.bgCard, padding: 20, paddingBottom: 0, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  tabs: { flexDirection: 'row' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: 14, color: COLORS.textMuted, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 16 },
  emptyText: { color: COLORS.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 20 },
  emptyBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: RADIUS.lg, marginTop: 24 },
  emptyBtnText: { color: COLORS.bg, fontWeight: '700', fontSize: 15 },
  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  stylistEmoji: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primaryDim, alignItems: 'center', justifyContent: 'center' },
  stylistName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  serviceCount: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: '600' },
  servicesBox: { marginTop: 10, marginLeft: 4 },
  guestLabel: { fontSize: 12, fontWeight: '700', color: COLORS.primary, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.4 },
  svcItem: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 3 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  meta: { fontSize: 13, color: COLORS.textSecondary },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.error, borderRadius: RADIUS.md, padding: 10, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: COLORS.error, fontSize: 13, fontWeight: '600' },
  rescheduleBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.primary, borderRadius: RADIUS.md, padding: 10, alignItems: 'center' },
  rescheduleText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  rebookBtn: { marginTop: 12, borderWidth: 1, borderColor: COLORS.primary, borderRadius: RADIUS.md, padding: 10, alignItems: 'center' },
  rebookText: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
  btnDisabled: { opacity: 0.5 },
});
