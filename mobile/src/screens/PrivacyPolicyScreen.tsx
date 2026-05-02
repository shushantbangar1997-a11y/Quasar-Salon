import React from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { COLORS, RADIUS } from '../theme';
import { PrivacyPolicyScreenProps } from '../navigation';

export default function PrivacyPolicyScreen({ navigation }: PrivacyPolicyScreenProps) {
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={s.container}>
        <Pressable onPress={() => navigation.goBack()} style={s.backRow}>
          <Text style={s.back}>← Back</Text>
        </Pressable>

        <Text style={s.title}>Privacy Policy</Text>
        <Text style={s.updated}>Last updated: 1 January 2026</Text>

        <Section title="1. Information we collect">
          We collect the information you provide when you create an account or book a service —
          your name, email address, phone number, and the details of your bookings. A phone number is required at sign-up so the salon can confirm your appointments and reach you about last-minute changes.
          We also collect basic device and usage data to keep the app secure and reliable.
        </Section>

        <Section title="2. How we use your information">
          We use your information to:
          {'\n'}• Create and manage your account
          {'\n'}• Confirm, remind, and track your appointments
          {'\n'}• Provide customer support
          {'\n'}• Improve the app's reliability and security
        </Section>

        <Section title="3. Sharing">
          We do not sell your personal data. We share information only with the service
          providers we use to run the app (such as Google Firebase for authentication and
          data storage), and only as needed to deliver the service.
        </Section>

        <Section title="4. Data retention">
          We keep your data while your account is active. When you delete your account,
          your profile and bookings are permanently removed from our systems within
          a reasonable time, except where we are required to retain limited records
          for legal or accounting purposes.
        </Section>

        <Section title="5. Your rights">
          You can access, correct, or delete your information at any time from
          Profile → Edit Profile and Profile → Delete Account. To request a copy of
          your data or for any other privacy question, contact us at the email below.
        </Section>

        <Section title="6. Children">
          Quasar Salon is intended for adults. We do not knowingly collect personal
          information from children under 13.
        </Section>

        <Section title="7. Contact us">
          For questions about this policy, please email support@quasarsalon.com.
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
