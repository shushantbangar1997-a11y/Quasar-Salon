import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, Image } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { COLORS, RADIUS } from '../theme';
import { SignUpScreenProps } from '../navigation';

export default function SignUpScreen({ navigation }: SignUpScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) { Alert.alert('Error', 'Please fill in all fields'); return; }
    if (password !== confirm) { Alert.alert('Error', 'Passwords do not match'); return; }
    if (password.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters'); return; }
    if (!auth) { navigation.navigate('MainTabs'); return; }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigation.navigate('MainTabs');
    } catch (e: unknown) {
      Alert.alert('Sign Up Failed', e instanceof Error ? e.message : 'Sign up failed');
    } finally {
      setLoading(false);
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
            <Image source={require('../../assets/quasar-logo.jpg')} style={s.logo} resizeMode="contain" />
          </View>

          <Text style={s.title}>Create Account</Text>
          <Text style={s.subtitle}>Join Quasar Salon today</Text>

          <TextInput style={s.input} placeholder="Full Name" placeholderTextColor={COLORS.textMuted} value={name} onChangeText={setName} />
          <TextInput style={s.input} placeholder="Email" placeholderTextColor={COLORS.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={s.input} placeholder="Password" placeholderTextColor={COLORS.textMuted} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
          <TextInput style={s.input} placeholder="Confirm Password" placeholderTextColor={COLORS.textMuted} value={confirm} onChangeText={setConfirm} secureTextEntry autoCapitalize="none" />

          <Pressable style={[s.btn, loading && { opacity: 0.7 }]} onPress={handleSignUp} disabled={loading}>
            <Text style={s.btnText}>{loading ? 'Creating Account…' : 'Create Account'}</Text>
          </Pressable>

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
  logo: { width: 150, height: 44 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 28 },
  input: { height: 54, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, paddingHorizontal: 16, fontSize: 15, marginBottom: 14, backgroundColor: COLORS.bgCard, color: COLORS.text },
  btn: { height: 54, backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  btnText: { color: COLORS.bg, fontSize: 16, fontWeight: '700' },
  loginLink: { marginTop: 20, alignItems: 'center' },
  loginText: { color: COLORS.textSecondary, fontSize: 14 },
});
