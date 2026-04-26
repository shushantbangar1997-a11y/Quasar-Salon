import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../firebase';
import { API_BASE_URL } from '../api';
import { COLORS, RADIUS } from '../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'OTP'>;
const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function OTPScreen({ route, navigation }: Props) {
  const { email } = route.params;
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const handleVerify = async () => {
    if (code.length !== OTP_LENGTH) { setError('Please enter the 6-digit code'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Verification failed'); return; }
      if (!auth) { navigation.navigate('MainTabs'); return; }
      await signInWithCustomToken(auth, data.token);
      navigation.navigate('MainTabs');
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setCode('');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to resend code'); return; }
      setCountdown(RESEND_SECONDS);
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={s.container}>
          <Pressable onPress={() => navigation.goBack()} style={s.backRow}>
            <Text style={s.back}>← Back</Text>
          </Pressable>

          <View style={s.header}>
            <Text style={s.title}>Check your email</Text>
            <Text style={s.subtitle}>
              We sent a 6-digit code to{'\n'}
              <Text style={s.emailText}>{email}</Text>
            </Text>
          </View>

          <Pressable style={s.codeBox} onPress={() => inputRef.current?.focus()}>
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <View
                key={i}
                style={[
                  s.digitBox,
                  code.length === i && s.digitBoxActive,
                  code.length > i && s.digitBoxFilled,
                ]}
              >
                <Text style={s.digitText}>{code[i] ?? ''}</Text>
              </View>
            ))}
          </Pressable>

          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={t => { setError(''); setCode(t.replace(/\D/g, '').slice(0, OTP_LENGTH)); }}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            style={s.hiddenInput}
            autoFocus
          />

          {error ? <Text style={s.error}>{error}</Text> : null}

          <Pressable
            style={[s.verifyBtn, (loading || code.length !== OTP_LENGTH) && { opacity: 0.6 }]}
            onPress={handleVerify}
            disabled={loading || code.length !== OTP_LENGTH}
          >
            {loading
              ? <ActivityIndicator color={COLORS.bg} />
              : <Text style={s.verifyBtnText}>Verify Code</Text>
            }
          </Pressable>

          <View style={s.resendRow}>
            {countdown > 0 ? (
              <Text style={s.countdownText}>Resend code in {countdown}s</Text>
            ) : (
              <Pressable onPress={handleResend} disabled={resending}>
                <Text style={[s.resendText, resending && { opacity: 0.5 }]}>
                  {resending ? 'Sending…' : 'Resend Code'}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  backRow: { alignSelf: 'flex-start', marginBottom: 32 },
  back: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  header: { marginBottom: 36 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },
  emailText: { color: COLORS.text, fontWeight: '600' },
  codeBox: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 4 },
  digitBox: {
    width: 46, height: 56, borderRadius: RADIUS.md, borderWidth: 1.5,
    borderColor: COLORS.border, backgroundColor: COLORS.bgCard,
    alignItems: 'center', justifyContent: 'center',
  },
  digitBoxActive: { borderColor: COLORS.primary, borderWidth: 2 },
  digitBoxFilled: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryDim },
  digitText: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  hiddenInput: { position: 'absolute', opacity: 0, height: 0, width: 0 },
  error: { color: COLORS.error, fontSize: 13, textAlign: 'center', marginTop: 12 },
  verifyBtn: {
    height: 54, backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    alignItems: 'center', justifyContent: 'center', marginTop: 28,
  },
  verifyBtnText: { color: COLORS.bg, fontSize: 16, fontWeight: '700' },
  resendRow: { alignItems: 'center', marginTop: 20 },
  countdownText: { fontSize: 14, color: COLORS.textMuted },
  resendText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
});
