import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, Image } from 'react-native';
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase';
import { COLORS, RADIUS } from '../theme';
import { LoginScreenProps } from '../navigation';

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Error', 'Please fill in all fields'); return; }
    if (!auth) { navigation.navigate('MainTabs'); return; }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('MainTabs');
    } catch (e: unknown) {
      Alert.alert('Login Failed', e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
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
            <Image source={require('../../assets/quasar-logo.jpg')} style={s.logo} resizeMode="contain" />
            <Text style={s.tagline}>Sign in to save your bookings</Text>
          </View>

          <TextInput
            style={s.input}
            placeholder="Email"
            placeholderTextColor={COLORS.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={s.input}
            placeholder="Password"
            placeholderTextColor={COLORS.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <Pressable style={[s.primaryBtn, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
            <Text style={s.primaryBtnText}>{loading ? 'Signing in…' : 'Sign In'}</Text>
          </Pressable>

          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or</Text>
            <View style={s.dividerLine} />
          </View>

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
  logoArea: { alignItems: 'center', marginBottom: 36 },
  logo: { width: 180, height: 54, marginBottom: 12 },
  tagline: { fontSize: 14, color: COLORS.textSecondary },
  input: { height: 54, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, paddingHorizontal: 16, fontSize: 15, marginBottom: 14, backgroundColor: COLORS.bgCard, color: COLORS.text },
  primaryBtn: { height: 54, backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryBtnText: { color: COLORS.bg, fontSize: 16, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { marginHorizontal: 12, color: COLORS.textMuted, fontSize: 13 },
  guestBtn: { height: 54, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  guestBtnText: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  signupLink: { marginTop: 20, alignItems: 'center' },
  signupText: { color: COLORS.textSecondary, fontSize: 14 },
});
