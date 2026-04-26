import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, SafeAreaView, ScrollView,
  StatusBar, Image, ActivityIndicator
} from 'react-native';
import { createUserWithEmailAndPassword, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { auth } from '../firebase';
import { API_BASE_URL } from '../api';
import { COLORS, RADIUS } from '../theme';
import { SignUpScreenProps } from '../navigation';

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen({ navigation }: SignUpScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [usePassword, setUsePassword] = useState(false);

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

  const handleSignUp = async () => {
    if (!name || !email || !password) { setError('Please fill in all fields'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!auth) { navigation.navigate('MainTabs'); return; }
    setError('');
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigation.navigate('MainTabs');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSignUp = async () => {
    if (!email || !email.includes('@')) { setOtpError('Please enter a valid email address'); return; }
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

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => navigation.goBack()} style={s.backRow}>
            <Text style={s.back}>← Back</Text>
          </Pressable>

          <View style={s.logoArea}>
            <Image source={require('../../assets/quasar-logo-new.png')} style={s.logo} resizeMode="contain" />
          </View>

          <Text style={s.title}>Create Account</Text>
          <Text style={s.subtitle}>Join Quasar Salon today</Text>

          {/* Google Sign-Up */}
          <Pressable
            style={[s.googleBtn, loading && { opacity: 0.6 }]}
            onPress={() => promptGoogleAsync()}
            disabled={loading}
          >
            <Text style={s.googleIcon}>G</Text>
            <Text style={s.googleBtnText}>Sign up with Google</Text>
          </Pressable>

          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or</Text>
            <View style={s.dividerLine} />
          </View>

          {/* OTP flow — primary */}
          {!usePassword && (
            <>
              <TextInput
                style={s.input}
                placeholder="Email"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={t => { setEmail(t); setOtpError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {otpError ? <Text style={s.errorText}>{otpError}</Text> : null}
              <Pressable
                style={[s.btn, sendingOtp && { opacity: 0.6 }]}
                onPress={handleOtpSignUp}
                disabled={sendingOtp}
              >
                {sendingOtp
                  ? <ActivityIndicator color={COLORS.bg} />
                  : <Text style={s.btnText}>✉️  Continue with Email Code</Text>
                }
              </Pressable>
              <Pressable style={s.switchLink} onPress={() => setUsePassword(true)}>
                <Text style={s.switchText}>Use password instead</Text>
              </Pressable>
            </>
          )}

          {/* Password flow — secondary */}
          {usePassword && (
            <>
              <TextInput style={s.input} placeholder="Full Name" placeholderTextColor={COLORS.textMuted} value={name} onChangeText={setName} />
              <TextInput style={s.input} placeholder="Email" placeholderTextColor={COLORS.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              <TextInput style={s.input} placeholder="Password" placeholderTextColor={COLORS.textMuted} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
              <TextInput style={s.input} placeholder="Confirm Password" placeholderTextColor={COLORS.textMuted} value={confirm} onChangeText={setConfirm} secureTextEntry autoCapitalize="none" />
              {error ? <Text style={s.errorText}>{error}</Text> : null}
              <Pressable style={[s.btn, loading && { opacity: 0.7 }]} onPress={handleSignUp} disabled={loading}>
                {loading
                  ? <ActivityIndicator color={COLORS.bg} />
                  : <Text style={s.btnText}>Create Account</Text>
                }
              </Pressable>
              <Pressable style={s.switchLink} onPress={() => setUsePassword(false)}>
                <Text style={s.switchText}>Use email code instead</Text>
              </Pressable>
            </>
          )}

          <Pressable onPress={() => navigation.navigate('Login')} style={s.loginLink}>
            <Text style={s.loginText}>
              Already have an account? <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Sign In</Text>
            </Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('MainTabs')} style={{ marginTop: 12, alignItems: 'center' }}>
            <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>Continue without account</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  backRow: { alignSelf: 'flex-start', marginBottom: 16 },
  back: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  logoArea: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 110, height: 110 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 },
  googleBtn: { height: 54, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, backgroundColor: COLORS.bgCard },
  googleIcon: { fontSize: 18, fontWeight: '800', color: '#4285F4' },
  googleBtnText: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { marginHorizontal: 12, color: COLORS.textMuted, fontSize: 13 },
  input: { height: 54, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, paddingHorizontal: 16, fontSize: 15, marginBottom: 14, backgroundColor: COLORS.bgCard, color: COLORS.text },
  errorText: { color: COLORS.error, fontSize: 13, marginBottom: 8 },
  btn: { height: 54, backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  btnText: { color: COLORS.bg, fontSize: 16, fontWeight: '700' },
  switchLink: { marginTop: 12, alignItems: 'center' },
  switchText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  loginLink: { marginTop: 20, alignItems: 'center' },
  loginText: { color: COLORS.textSecondary, fontSize: 14 },
});
