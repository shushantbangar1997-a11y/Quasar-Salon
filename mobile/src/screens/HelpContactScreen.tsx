import React from 'react';
import {
  View, Text, Pressable, StyleSheet, SafeAreaView, StatusBar, ScrollView, Linking, Alert,
} from 'react-native';
import { COLORS, RADIUS } from '../theme';
import { HelpContactScreenProps } from '../navigation';

const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? 'support@quasarsalon.com';
const SUPPORT_PHONE = process.env.EXPO_PUBLIC_SUPPORT_PHONE ?? '+91 98765 43210';
const SALON_ADDRESS = process.env.EXPO_PUBLIC_SALON_ADDRESS
  ?? 'Quasar Salon\nGround Floor, Plot 21, MG Road\nBengaluru, Karnataka 560001\nIndia';

async function openLink(url: string) {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
    else Alert.alert('Cannot open', 'Your device cannot open this link.');
  } catch {
    Alert.alert('Cannot open', 'Your device cannot open this link.');
  }
}

export default function HelpContactScreen({ navigation }: HelpContactScreenProps) {
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={s.container}>
        <Pressable onPress={() => navigation.goBack()} style={s.backRow}>
          <Text style={s.back}>← Back</Text>
        </Pressable>

        <Text style={s.title}>Help & Contact</Text>
        <Text style={s.subtitle}>We'd love to hear from you.</Text>

        <Pressable style={s.card} onPress={() => openLink(`mailto:${SUPPORT_EMAIL}`)}>
          <Text style={s.cardLabel}>Email us</Text>
          <Text style={s.cardValue}>{SUPPORT_EMAIL}</Text>
          <Text style={s.cardHint}>We typically reply within one business day.</Text>
        </Pressable>

        <Pressable style={s.card} onPress={() => openLink(`tel:${SUPPORT_PHONE.replace(/\s+/g, '')}`)}>
          <Text style={s.cardLabel}>Call the salon</Text>
          <Text style={s.cardValue}>{SUPPORT_PHONE}</Text>
          <Text style={s.cardHint}>Open Mon–Sat, 10:00 AM – 8:00 PM.</Text>
        </Pressable>

        <Pressable
          style={s.card}
          onPress={() => openLink(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SALON_ADDRESS.replace(/\n/g, ', '))}`)}
        >
          <Text style={s.cardLabel}>Visit us</Text>
          <Text style={s.cardAddress}>{SALON_ADDRESS}</Text>
          <Text style={s.cardHint}>Tap to open in Maps.</Text>
        </Pressable>

        <View style={s.faqBox}>
          <Text style={s.faqTitle}>Common questions</Text>
          <Text style={s.faqQ}>How do I cancel a booking?</Text>
          <Text style={s.faqA}>Open My Bookings → Cancel. You can cancel up to 2 hours before your appointment. Within that window, please call the salon.</Text>
          <Text style={s.faqQ}>How do I reschedule?</Text>
          <Text style={s.faqA}>Tap Reschedule on any upcoming booking to pick a new date or stylist.</Text>
          <Text style={s.faqQ}>Can I delete my account?</Text>
          <Text style={s.faqA}>Yes — go to Profile → Delete Account. This permanently removes your data and cancels future bookings.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 24, paddingBottom: 60 },
  backRow: { alignSelf: 'flex-start', marginBottom: 16 },
  back: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 },
  card: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 14,
  },
  cardLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: 4 },
  cardValue: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  cardAddress: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 6, lineHeight: 22 },
  cardHint: { fontSize: 12, color: COLORS.textSecondary },
  faqBox: { marginTop: 14, padding: 16, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border },
  faqTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
  faqQ: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginTop: 8 },
  faqA: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4, lineHeight: 19 },
});
