import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView } from 'react-native';

const P = '#E91E8C';

export default function HairdresserDetailScreen({ route, navigation }: any) {
  const { provider } = route.params;
  const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  const availableDays = days.filter(d => provider.availability?.[d]).map(d => d.slice(0,3).charAt(0).toUpperCase() + d.slice(1,3));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <Pressable onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start' }}>
            <Text style={{ color: P, fontSize: 15, fontWeight: '600' }}>← Back</Text>
          </Pressable>
          <View style={s.emojiCircle}>
            <Text style={{ fontSize: 70 }}>{provider.emoji}</Text>
          </View>
          <Text style={s.name}>{provider.name}</Text>
          <Text style={{ color: '#8E8E93', marginTop: 4 }}>⭐ {provider.rating} · {provider.reviewCount} reviews</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 10, gap: 6 }}>
            {provider.categories.map((c: string) => (
              <View key={c} style={s.chip}><Text style={{ color: P, fontSize: 12, fontWeight: '600' }}>{c}</Text></View>
            ))}
          </View>
        </View>

        <View style={{ padding: 20 }}>
          <Text style={{ color: '#8E8E93', marginBottom: 6 }}>📍 {provider.location.city}</Text>
          {availableDays.length > 0 && <Text style={{ color: '#8E8E93', marginBottom: 16 }}>📅 {availableDays.join(' · ')}</Text>}

          <Text style={s.sec}>About</Text>
          <Text style={{ color: '#6B6B7B', lineHeight: 22, marginBottom: 20 }}>{provider.bio}</Text>

          <Text style={s.sec}>Services</Text>
          {provider.services.map((sv: any, i: number) => (
            <Pressable key={i} onPress={() => navigation.navigate('Booking', { provider, service: sv })} style={s.serviceCard}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#1A1A2E' }}>{sv.name}</Text>
                <Text style={{ color: '#8E8E93', fontSize: 12, marginTop: 3 }}>{sv.durationMins} mins · {sv.category}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 17, fontWeight: '700', color: '#1A1A2E' }}>${sv.price}</Text>
                <View style={{ backgroundColor: P, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 8, marginTop: 5 }}>
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Book</Text>
                </View>
              </View>
            </Pressable>
          ))}
          <View style={{ height: 80 }} />
        </View>
      </ScrollView>

      <View style={s.footer}>
        <Pressable style={s.cta} onPress={() => navigation.navigate('Booking', { provider, service: provider.services[0] })}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Book Appointment</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  hero: { backgroundColor: '#fff', alignItems: 'center', padding: 20, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 4 },
  emojiCircle: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#FFF0F7', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  name: { fontSize: 26, fontWeight: '800', color: '#1A1A2E', marginTop: 14 },
  chip: { backgroundColor: '#FFF0F7', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  sec: { fontSize: 18, fontWeight: '700', color: '#1A1A2E', marginBottom: 10 },
  serviceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  cta: { backgroundColor: '#E91E8C', borderRadius: 16, padding: 16, alignItems: 'center' },
});
