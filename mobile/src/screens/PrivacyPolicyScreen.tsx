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
        <Text style={s.updated}>Last updated: 6 May 2025</Text>

        <Section title="1. Information we collect">
          We collect the information you provide when you create an account or book a service:
          {'\n\n'}• Name and email address — required to create your account and send booking confirmations.
          {'\n'}• Phone number — optional; you may add it later via Edit Profile so the salon can reach you about last-minute changes.
          {'\n'}• Booking details — the services, date, time, and stylist you choose.
          {'\n'}• Profile photo — optional; only uploaded if you choose to add one.
          {'\n'}• Device and usage data — basic technical information (device type, app version) to keep the service secure and reliable.
        </Section>

        <Section title="2. Sign-in methods and third-party data sharing">
          You can sign in with your email address, a one-time code (OTP), or your Google account.
          {'\n\n'}When you choose Google Sign-In, Google shares your name, email address, and profile photo with us as part of the authentication process. We do not receive your Google password. Your choice of sign-in method does not affect how your data is used inside the app.
        </Section>

        <Section title="3. How we use your information">
          We use your information to:
          {'\n\n'}• Create and manage your account
          {'\n'}• Confirm, remind, and track your salon appointments
          {'\n'}• Send booking confirmation, reschedule, and cancellation emails
          {'\n'}• Provide customer support
          {'\n'}• Improve the app's reliability and security
        </Section>

        <Section title="4. Service providers and data processors">
          We use the following third-party services to operate the app. Each acts as a data processor on our behalf and is contractually required to protect your data:
          {'\n\n'}• Google Firebase (Firebase Authentication, Cloud Firestore, Cloud Storage) — stores your account information, bookings, and any photos you upload. Firebase is operated by Google LLC.
          {'\n'}• Gmail / Google Workspace — used to send OTP codes and booking notification emails.
          {'\n\n'}We do not sell your personal data to any third party.
        </Section>

        <Section title="5. Security">
          All data is transmitted over HTTPS (TLS encryption). Your data is stored in Google Firebase, which employs industry-standard security measures including encryption at rest. We do not store payment card information — all payments are handled in person at the salon.
        </Section>

        <Section title="6. Data retention">
          We keep your data while your account is active. When you delete your account (via Profile → Delete Account), your profile and booking history are permanently removed from our systems within a reasonable time, except where we are required to retain limited records for legal or accounting purposes.
        </Section>

        <Section title="7. Your rights">
          You can access and correct your information at any time from Profile → Edit Profile. You can permanently delete your account from Profile → Delete Account.
          {'\n\n'}If you are in the European Economic Area or another jurisdiction with data-protection rights (such as the right to data portability or to lodge a complaint with a supervisory authority), please contact us at the email below.
        </Section>

        <Section title="8. International users">
          Quasar Salon is operated in India. If you are accessing the app from outside India, your information may be transferred to and processed in India or other countries where Google's infrastructure operates. By using the app, you consent to this transfer.
        </Section>

        <Section title="9. Children">
          Quasar Salon is intended for adults (13 and older). We do not knowingly collect personal information from children under 13. If we learn that we have done so, we will delete the information promptly.
        </Section>

        <Section title="10. Contact us">
          For questions about this Privacy Policy, please email us at support@quasarsalon.com.
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
