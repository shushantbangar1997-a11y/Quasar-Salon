import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, SafeAreaView, StatusBar,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { COLORS, RADIUS } from '../theme';
import { DeleteAccountScreenProps } from '../navigation';
import { ApiError, deleteAccount } from '../api';

const CONFIRM_PHRASE = 'DELETE';

export default function DeleteAccountScreen({ navigation }: DeleteAccountScreenProps) {
  const user = auth?.currentUser;
  const [confirmText, setConfirmText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = confirmText.trim().toUpperCase() === CONFIRM_PHRASE && !submitting && !!user && !user.isAnonymous;

  const handleDelete = async () => {
    setError('');
    setSubmitting(true);
    try {
      await deleteAccount();
      try { if (auth) await signOut(auth); } catch { /* ignore */ }
      Alert.alert(
        'Account deleted',
        'Your account and bookings have been permanently removed.',
        [{ text: 'OK', onPress: () => navigation.navigate('MainTabs') }]
      );
    } catch (e: unknown) {
      if (e instanceof ApiError) setError(e.message);
      else setError('Could not delete your account. Please try again or contact support.');
    } finally {
      setSubmitting(false);
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

          <Text style={s.title}>Delete Account</Text>
          <Text style={s.subtitle}>This action is permanent and cannot be undone.</Text>

          <View style={s.warningBox}>
            <Text style={s.warningTitle}>What gets deleted</Text>
            <Text style={s.warningItem}>• Your account and sign-in credentials</Text>
            <Text style={s.warningItem}>• Your saved profile (name, phone, photo)</Text>
            <Text style={s.warningItem}>• All your bookings and history</Text>
            <Text style={s.warningItem}>• Any upcoming appointments will be cancelled</Text>
          </View>

          {!user || user.isAnonymous ? (
            <View style={s.notice}>
              <Text style={s.noticeText}>You need to be signed in to delete an account.</Text>
            </View>
          ) : (
            <>
              <Text style={s.label}>Type <Text style={s.confirmWord}>DELETE</Text> to confirm</Text>
              <TextInput
                style={s.input}
                placeholder="DELETE"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="characters"
                autoCorrect={false}
                value={confirmText}
                onChangeText={t => { setConfirmText(t); setError(''); }}
              />
              {error ? <Text style={s.error}>{error}</Text> : null}

              <Pressable
                style={[s.deleteBtn, !canSubmit && s.deleteBtnDisabled]}
                onPress={handleDelete}
                disabled={!canSubmit}
              >
                {submitting
                  ? <ActivityIndicator color="#FFFFFF" />
                  : <Text style={s.deleteBtnText}>Permanently Delete My Account</Text>
                }
              </Pressable>
            </>
          )}

          <Pressable style={s.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={s.cancelBtnText}>Keep My Account</Text>
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
  title: { fontSize: 28, fontWeight: '800', color: COLORS.error, marginBottom: 6 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 },
  warningBox: {
    backgroundColor: COLORS.errorBg, borderRadius: RADIUS.lg, padding: 16,
    borderWidth: 1, borderColor: COLORS.error, marginBottom: 24,
  },
  warningTitle: { fontSize: 14, fontWeight: '800', color: COLORS.error, marginBottom: 8 },
  warningItem: { fontSize: 13, color: COLORS.text, marginBottom: 4, lineHeight: 19 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  confirmWord: { color: COLORS.error, fontWeight: '800' },
  input: {
    height: 54, borderWidth: 1.5, borderColor: COLORS.error, borderRadius: RADIUS.lg,
    paddingHorizontal: 16, fontSize: 15, backgroundColor: COLORS.bgCard, color: COLORS.text,
    letterSpacing: 2,
  },
  notice: { backgroundColor: COLORS.bgElevated, padding: 14, borderRadius: RADIUS.lg, marginTop: 12 },
  noticeText: { color: COLORS.textSecondary, fontSize: 14 },
  error: { color: COLORS.error, fontSize: 13, marginTop: 12 },
  deleteBtn: { height: 54, backgroundColor: COLORS.error, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  deleteBtnDisabled: { opacity: 0.4 },
  deleteBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  cancelBtn: { marginTop: 14, alignItems: 'center', padding: 14 },
  cancelBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
});
