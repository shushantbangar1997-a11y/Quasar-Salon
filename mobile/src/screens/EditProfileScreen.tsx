import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, SafeAreaView, StatusBar,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import { COLORS, RADIUS } from '../theme';
import { EditProfileScreenProps } from '../navigation';
import { ApiError, getMyProfile, updateUserProfile } from '../api';

export default function EditProfileScreen({ navigation }: EditProfileScreenProps) {
  const user = auth?.currentUser;
  const [name, setName] = useState(user?.displayName ?? '');
  const [phone, setPhone] = useState('');
  const [hydrating, setHydrating] = useState(!!user);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Hydrate name + phone from the backend so the user can see and edit
  // what's currently saved on their account (rather than overwriting blindly).
  useEffect(() => {
    if (!user) { setHydrating(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const profile = await getMyProfile();
        if (cancelled) return;
        if (profile.name) setName(profile.name);
        if (profile.phone) setPhone(profile.phone);
      } catch {
        // non-fatal — user can still edit and save
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const handleSave = async () => {
    setError('');
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) { setError('Please enter your name.'); return; }
    if (!trimmedPhone) {
      setError('Phone number is required so the salon can confirm your appointments.');
      return;
    }
    if (!/^\+?\d[\d\s\-()]{6,19}$/.test(trimmedPhone)) {
      setError('Please enter a valid phone number (7–15 digits, optional leading +).');
      return;
    }

    setSaving(true);
    try {
      if (user) {
        try { await updateProfile(user, { displayName: trimmedName }); } catch { /* non-fatal */ }
      }
      await updateUserProfile({ name: trimmedName, phone: trimmedPhone });
      Alert.alert('Profile updated', 'Your details have been saved.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: unknown) {
      if (e instanceof ApiError) setError(e.message);
      else setError('Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
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

          <Text style={s.title}>Edit Profile</Text>
          <Text style={s.subtitle}>Update your name and contact details</Text>

          <Text style={s.label}>Email</Text>
          <View style={[s.input, s.inputDisabled]}>
            <Text style={s.inputDisabledText}>{user?.email ?? 'Not signed in'}</Text>
          </View>

          <Text style={s.label}>Full name</Text>
          <TextInput
            style={s.input}
            placeholder={hydrating ? 'Loading…' : 'Your name'}
            placeholderTextColor={COLORS.textMuted}
            value={name}
            onChangeText={setName}
            editable={!hydrating}
          />

          <Text style={s.label}>Phone number</Text>
          <TextInput
            style={s.input}
            placeholder={hydrating ? 'Loading…' : '+91 98765 43210'}
            placeholderTextColor={COLORS.textMuted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoComplete="tel"
            editable={!hydrating}
          />
          <Text style={s.helper}>Required — used to confirm your appointments and contact you about last-minute changes.</Text>

          {error ? <Text style={s.error}>{error}</Text> : null}

          <Pressable
            style={[s.btn, (saving || hydrating) && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving || hydrating}
          >
            {(saving || hydrating)
              ? <ActivityIndicator color={COLORS.bg} />
              : <Text style={s.btnText}>Save Changes</Text>}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 24, paddingBottom: 60 },
  backRow: { alignSelf: 'flex-start', marginBottom: 16 },
  back: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6, marginTop: 8 },
  input: {
    height: 54, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg,
    paddingHorizontal: 16, fontSize: 15, backgroundColor: COLORS.bgCard, color: COLORS.text,
    justifyContent: 'center',
  },
  inputDisabled: { backgroundColor: COLORS.bgElevated },
  inputDisabledText: { color: COLORS.textMuted, fontSize: 15 },
  helper: { fontSize: 12, color: COLORS.textMuted, marginTop: 6 },
  error: { color: COLORS.error, fontSize: 13, marginTop: 14 },
  btn: { height: 54, backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  btnText: { color: COLORS.bg, fontSize: 16, fontWeight: '700' },
});
