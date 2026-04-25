import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const P = '#E91E8C';

export default function SignUpScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) { Alert.alert('Error', 'Please fill in all fields'); return; }
    if (password !== confirm) { Alert.alert('Error', 'Passwords do not match'); return; }
    if (password.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters'); return; }

    if (!auth) {
      navigation.navigate('MainTabs');
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigation.navigate('MainTabs');
    } catch (e: any) {
      Alert.alert('Sign Up Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => navigation.goBack()} style={{ marginBottom: 20 }}>
            <Text style={{ color: P, fontSize: 15, fontWeight: '600' }}>← Back</Text>
          </Pressable>

          <Text style={s.title}>Create Account</Text>
          <Text style={s.subtitle}>Join BeautyBooking today</Text>

          <TextInput style={s.input} placeholder="Full Name" placeholderTextColor="#aaa" value={name} onChangeText={setName} />
          <TextInput style={s.input} placeholder="Email" placeholderTextColor="#aaa" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={s.input} placeholder="Password" placeholderTextColor="#aaa" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
          <TextInput style={s.input} placeholder="Confirm Password" placeholderTextColor="#aaa" value={confirm} onChangeText={setConfirm} secureTextEntry autoCapitalize="none" />

          <Pressable style={s.btn} onPress={handleSignUp} disabled={loading}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
              {loading ? 'Creating Account…' : 'Create Account'}
            </Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('Login')} style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ color: '#8E8E93', fontSize: 14 }}>
              Already have an account? <Text style={{ color: P, fontWeight: '700' }}>Sign In</Text>
            </Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('MainTabs')} style={{ marginTop: 12, alignItems: 'center' }}>
            <Text style={{ color: '#aaa', fontSize: 13 }}>Continue without account</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 30, paddingBottom: 40 },
  title: { fontSize: 30, fontWeight: '800', color: '#1A1A2E', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#8E8E93', marginBottom: 32 },
  input: { height: 54, borderWidth: 1, borderColor: '#E5E5EA', borderRadius: 14, paddingHorizontal: 16, fontSize: 15, marginBottom: 14, backgroundColor: '#F8F9FA', color: '#1A1A2E' },
  btn: { height: 54, backgroundColor: P, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
});
