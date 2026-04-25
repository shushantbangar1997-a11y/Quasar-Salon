import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase';

const P = '#E91E8C';

export default function LoginScreen({ navigation }: any) {
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
    } catch (e: any) {
      Alert.alert('Login Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    if (auth) {
      try { await signInAnonymously(auth); } catch (_) {}
    }
    navigation.navigate('MainTabs');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={s.container}>
          <Pressable onPress={() => navigation.navigate('MainTabs')} style={{ alignSelf: 'flex-start', marginBottom: 24 }}>
            <Text style={{ color: P, fontSize: 15, fontWeight: '600' }}>← Back</Text>
          </Pressable>

          <View style={s.logoArea}>
            <View style={s.logoCircle}><Text style={{ fontSize: 50 }}>💇‍♀️</Text></View>
            <Text style={s.appName}>BeautyBooking</Text>
            <Text style={s.tagline}>Sign in to save your bookings</Text>
          </View>

          <TextInput
            style={s.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={s.input}
            placeholder="Password"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <Pressable style={s.primaryBtn} onPress={handleLogin} disabled={loading}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Text>
          </Pressable>

          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or</Text>
            <View style={s.dividerLine} />
          </View>

          <Pressable style={s.guestBtn} onPress={handleGuest} disabled={loading}>
            <Text style={{ color: '#1A1A2E', fontSize: 15, fontWeight: '600' }}>Continue as Guest</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('SignUp')}
            style={{ marginTop: 20, alignItems: 'center' }}
          >
            <Text style={{ color: '#8E8E93', fontSize: 14 }}>
              Don't have an account? <Text style={{ color: P, fontWeight: '700' }}>Sign Up</Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 30 },
  logoArea: { alignItems: 'center', marginBottom: 36 },
  logoCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#FFF0F7', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  appName: { fontSize: 28, fontWeight: '800', color: '#1A1A2E' },
  tagline: { fontSize: 14, color: '#8E8E93', marginTop: 6 },
  input: { height: 54, borderWidth: 1, borderColor: '#E5E5EA', borderRadius: 14, paddingHorizontal: 16, fontSize: 15, marginBottom: 14, backgroundColor: '#F8F9FA', color: '#1A1A2E' },
  primaryBtn: { height: 54, backgroundColor: P, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E5EA' },
  dividerText: { marginHorizontal: 12, color: '#8E8E93', fontSize: 13 },
  guestBtn: { height: 54, borderWidth: 1.5, borderColor: '#E5E5EA', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
