import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { DEMO_PROVIDERS } from '../demoData';

const P = '#E91E8C';

const DEMO_BOOKINGS = [
  { id: 'b1', provider: DEMO_PROVIDERS[0], service: DEMO_PROVIDERS[0].services[0], date: 'Tomorrow, Apr 26', time: '10:00 AM', status: 'confirmed' },
  { id: 'b2', provider: DEMO_PROVIDERS[2], service: DEMO_PROVIDERS[2].services[0], date: 'Fri, Apr 28', time: '2:30 PM', status: 'pending' },
  { id: 'b3', provider: DEMO_PROVIDERS[1], service: DEMO_PROVIDERS[1].services[1], date: 'Mon, Apr 14', time: '11:00 AM', status: 'completed' },
  { id: 'b4', provider: DEMO_PROVIDERS[3], service: DEMO_PROVIDERS[3].services[0], date: 'Sun, Apr 7', time: '3:00 PM', status: 'completed' },
];

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  confirmed: { bg: '#E8F5E9', text: '#2E7D32', label: '✓ Confirmed' },
  pending: { bg: '#FFF8E1', text: '#F57F17', label: '⏳ Pending' },
  completed: { bg: '#F3F4F6', text: '#6B7280', label: '✅ Completed' },
  cancelled: { bg: '#FEECEC', text: '#C62828', label: '✗ Cancelled' },
};

export default function MyBookingsScreen({ navigation }: any) {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const upcoming = DEMO_BOOKINGS.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const past = DEMO_BOOKINGS.filter(b => b.status === 'completed' || b.status === 'cancelled');
  const list = tab === 'upcoming' ? upcoming : past;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
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
            <Text style={{ fontSize: 50 }}>📅</Text>
            <Text style={s.emptyTitle}>No {tab} bookings</Text>
            <Text style={s.emptyText}>Browse providers and book your first appointment</Text>
            <Pressable style={s.emptyBtn} onPress={() => navigation.navigate('Home')}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Browse Providers</Text>
            </Pressable>
          </View>
        ) : (
          list.map(b => {
            const sc = STATUS_COLORS[b.status] || STATUS_COLORS.pending;
            return (
              <View key={b.id} style={s.card}>
                <View style={s.cardTop}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={s.emojiCircle}>
                      <Text style={{ fontSize: 26 }}>{b.provider.emoji}</Text>
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={s.cardName}>{b.provider.name}</Text>
                      <Text style={s.cardService}>{b.service.name}</Text>
                    </View>
                    <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
                      <Text style={[s.statusText, { color: sc.text }]}>{sc.label}</Text>
                    </View>
                  </View>
                </View>
                <View style={s.cardDivider} />
                <View style={s.cardBottom}>
                  <View style={s.cardDetail}>
                    <Text style={s.cardDetailIcon}>📅</Text>
                    <Text style={s.cardDetailText}>{b.date}</Text>
                  </View>
                  <View style={s.cardDetail}>
                    <Text style={s.cardDetailIcon}>🕐</Text>
                    <Text style={s.cardDetailText}>{b.time}</Text>
                  </View>
                  <View style={s.cardDetail}>
                    <Text style={s.cardDetailIcon}>💰</Text>
                    <Text style={s.cardDetailText}>${b.service.price}</Text>
                  </View>
                </View>
                {b.status === 'confirmed' || b.status === 'pending' ? (
                  <Pressable style={s.cancelBtn}>
                    <Text style={s.cancelText}>Cancel Booking</Text>
                  </Pressable>
                ) : b.status === 'completed' ? (
                  <Pressable style={s.rebookBtn} onPress={() => navigation.navigate('ProviderDetail', { provider: b.provider })}>
                    <Text style={{ color: P, fontWeight: '700', fontSize: 13 }}>Book Again</Text>
                  </Pressable>
                ) : null}
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
  header: { backgroundColor: '#fff', padding: 20, paddingBottom: 0, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  title: { fontSize: 26, fontWeight: '800', color: '#1A1A2E', marginBottom: 16 },
  tabs: { flexDirection: 'row' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: P },
  tabText: { fontSize: 14, color: '#8E8E93', fontWeight: '600' },
  tabTextActive: { color: P },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A2E', marginTop: 16 },
  emptyText: { color: '#8E8E93', marginTop: 8, textAlign: 'center' },
  emptyBtn: { backgroundColor: P, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 24 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardTop: {},
  emojiCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#FFF0F7', alignItems: 'center', justifyContent: 'center' },
  cardName: { fontSize: 16, fontWeight: '700', color: '#1A1A2E' },
  cardService: { fontSize: 13, color: P, marginTop: 2, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: '600' },
  cardDivider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: 12 },
  cardBottom: { flexDirection: 'row', gap: 16 },
  cardDetail: { flexDirection: 'row', alignItems: 'center' },
  cardDetailIcon: { fontSize: 14, marginRight: 4 },
  cardDetailText: { fontSize: 13, color: '#6B6B7B' },
  cancelBtn: { marginTop: 12, borderWidth: 1, borderColor: '#E5E5EA', borderRadius: 10, padding: 10, alignItems: 'center' },
  cancelText: { color: '#C62828', fontSize: 13, fontWeight: '600' },
  rebookBtn: { marginTop: 12, borderWidth: 1, borderColor: P, borderRadius: 10, padding: 10, alignItems: 'center' },
});
