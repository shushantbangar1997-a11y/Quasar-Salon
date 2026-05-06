import React from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { COLORS, RADIUS } from '../theme';
import { TermsScreenProps } from '../navigation';

export default function TermsScreen({ navigation }: TermsScreenProps) {
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={s.container}>
        <Pressable onPress={() => navigation.goBack()} style={s.backRow}>
          <Text style={s.back}>← Back</Text>
        </Pressable>

        <Text style={s.title}>Terms of Service</Text>
        <Text style={s.updated}>Last updated: 6 May 2025</Text>

        <Section title="1. Acceptance of terms">
          By creating an account or using Quasar Salon, you agree to these Terms. If you do not agree, please do not use the app.
        </Section>

        <Section title="2. Booking and cancellation">
          Bookings made through the app are confirmed once you receive an in-app confirmation and email. You may cancel or reschedule a booking up to 2 hours before the start time through the app. Within 2 hours of the appointment, please call the salon directly.
          {'\n\n'}Repeated no-shows may result in restricted access to online booking.
        </Section>

        <Section title="3. Payment">
          The Quasar Salon app does not process any payments. All payments are made in person at the salon at the time of service. Prices shown in the app are estimates and may vary based on the actual services performed.
        </Section>

        <Section title="4. Acceptable use">
          You agree not to misuse the app, attempt to access it in ways that are not intended, or use it for unlawful purposes. We may suspend or terminate accounts that violate these Terms.
        </Section>

        <Section title="5. User content">
          Any information you submit (such as your name, phone number, or profile photo) must be accurate and yours to share. You grant Quasar Salon a limited licence to display this information within the app solely to provide the service.
        </Section>

        <Section title="6. Limitation of liability">
          Quasar Salon is provided "as is". To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the app.
        </Section>

        <Section title="7. Changes to these Terms">
          We may update these Terms from time to time. We will note the "Last updated" date at the top of this page when we do. Continued use of the app after an update constitutes acceptance of the revised Terms.
        </Section>

        <Section title="8. Governing law">
          These Terms are governed by and construed in accordance with the laws of India. Any dispute arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in Mumbai, Maharashtra, India.
        </Section>

        <Section title="9. Contact">
          Questions about these Terms? Email us at support@quasarsalon.com.
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <Text style={s.sectionBody}>{children}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 24, paddingBottom: 60 },
  backRow: { alignSelf: 'flex-start', marginBottom: 16 },
  back: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  updated: { fontSize: 13, color: COLORS.textMuted, marginTop: 4, marginBottom: 20 },
  section: { marginBottom: 18, padding: 16, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  sectionBody: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 21 },
});
