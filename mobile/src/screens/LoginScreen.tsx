import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, SafeAreaView, StatusBar,
  Image, ActivityIndicator
} from 'react-native';
import { signInWithEmailAndPassword, signInAnonymously, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { auth } from '../firebase';
import { API_BASE_URL } from '../api';
import { COLORS, RADIUS } from '../theme';
import { LoginScreenProps } from '../navigation';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');

  const [_googleRequest, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  React.useEffect(() => {
    if (googleResponse?.type === 'success') {
      const { authentication } = googleResponse;
      if (authentication?.idToken && auth) {
        setLoading(true);
        const credential = GoogleAuthProvider.credential(authentication.idToken);
        signInWithCredential(auth, credential)
          .then(() => navigation.navigate('MainTabs'))
          .catch(e => setError(e instanceof Error ? e.message : 'Google sign-in failed'))
          .finally(() => setLoading(false));
      }
    }
  }, [googleResponse]);

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    if (!auth) { navigation.navigate('MainTabs'); return; }
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('MainTabs');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSignIn = async () => {
    if (!email || !email.includes('@')) { setOtpError('Please enter a valid email address above first'); return; }
    setOtpError('');
    setSendingOtp(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setOtpError(data.error ?? 'Failed to send code'); return; }
      navigation.navigate('OTP', { email: email.toLowerCase().trim() });
    } catch {
      setOtpError('Network error. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleGuest = async () => {
    if (auth) { try { await signInAnonymously(auth); } catch (_) {} }
    navigation.navigate('MainTabs');
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={s.container}>
          <Pressable onPress={() => navigation.navigate('MainTabs')} style={s.backRow}>
            <Text style={s.back}>← Back</Text>
          </Pressable>

          <View style={s.logoArea}>
            <Image source={require('../../assets/quasar-logo-new.png')} style={s.logo} resizeMode="contain" />
            <Text style={s.tagline}>Sign in to save your bookings</Text>
          </View>

          <TextInput
            style={s.input}
            placeholder="Email"
            placeholderTextColor={COLORS.textMuted}
            value={email}
            onChangeText={t => { setEmail(t); setError(''); setOtpError(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={s.passwordRow}>
            <TextInput
              style={[s.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Password"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={t => { setPassword(t); setError(''); }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <Pressable style={s.eyeBtn} onPress={() => setShowPassword(v => !v)}>
              <Text style={s.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
            </Pressable>
          </View>

          {error ? <Text style={s.errorText}>{error}</Text> : null}

          <Pressable
            style={[s.primaryBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={COLORS.bg} />
              : <Text style={s.primaryBtnText}>Sign In</Text>
            }
          </Pressable>

          <Pressable
            style={[s.otpBtn, sendingOtp && { opacity: 0.6 }]}
            onPress={handleOtpSignIn}
            disabled={sendingOtp}
          >
            {sendingOtp
              ? <ActivityIndicator color={COLORS.primary} />
              : <Text style={s.otpBtnText}>✉️  Sign in with Email Code</Text>
            }
          </Pressable>
          {otpError ? <Text style={s.errorText}>{otpError}</Text> : null}

          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or</Text>
            <View style={s.dividerLine} />
          </View>

          <Pressable
            style={[s.googleBtn, loading && { opacity: 0.6 }]}
            onPress={() => promptGoogleAsync()}
            disabled={loading}
          >
            <Text style={s.googleIcon}>G</Text>
            <Text style={s.googleBtnText}>Continue with Google</Text>
          </Pressable>

          <Pressable style={s.guestBtn} onPress={handleGuest} disabled={loading}>
            <Text style={s.guestBtnText}>Continue as Guest</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('SignUp')} style={s.signupLink}>
            <Text style={s.signupText}>
              Don't have an account? <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Sign Up</Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  backRow: { alignSelf: 'flex-start', marginBottom: 20 },
  back: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  logoArea: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 120, height: 120, marginBottom: 12 },
  tagline: { fontSize: 14, color: COLORS.textSecondary },
  input: { height: 54, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, paddingHorizontal: 16, fontSize: 15, marginBottom: 14, backgroundColor: COLORS.bgCard, color: COLORS.text },
  passwordRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
  eyeBtn: { padding: 8 },
  eyeText: { fontSize: 18 },
  errorText: { color: COLORS.error, fontSize: 13, marginBottom: 8 },
  primaryBtn: { height: 54, backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryBtnText: { color: COLORS.bg, fontSize: 16, fontWeight: '700' },
  otpBtn: { height: 54, borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', marginTop: 10, flexDirection: 'row', gap: 8 },
  otpBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { marginHorizontal: 12, color: COLORS.textMuted, fontSize: 13 },
  googleBtn: { height: 54, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, marginBottom: 10, backgroundColor: COLORS.bgCard },
  googleIcon: { fontSize: 18, fontWeight: '800', color: '#4285F4' },
  googleBtnText: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  guestBtn: { height: 54, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  guestBtnText: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  signupLink: { marginTop: 20, alignItems: 'center' },
  signupText: { color: COLORS.textSecondary, fontSize: 14 },
});
