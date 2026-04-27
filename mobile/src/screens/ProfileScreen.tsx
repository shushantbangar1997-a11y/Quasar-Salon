import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  SafeAreaView, StatusBar, Alert, Switch, Image,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { COLORS, RADIUS, SHADOW } from '../theme';
import { ProfileScreenProps } from '../navigation';
import { useAdmin } from '../AdminContext';

type MenuRow = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  screen: 'Bookings' | null;
  isToggle?: boolean;
  iconBg: string;
  iconColor: string;
};

const MENU_ITEMS: MenuRow[] = [
  { icon: 'calendar-outline',         label: 'My Bookings',      screen: 'Bookings', iconBg: '#FDF6E8', iconColor: COLORS.primary },
  { icon: 'card-outline',             label: 'Payment Methods',  screen: null,       iconBg: '#EAF4F0', iconColor: '#2E7D60' },
  { icon: 'notifications-outline',    label: 'Notifications',    screen: null,       iconBg: '#EBF0FB', iconColor: '#3B6CC9', isToggle: true },
  { icon: 'help-circle-outline',      label: 'Help & Support',   screen: null,       iconBg: '#F3EEFB', iconColor: '#7B3FD4' },
  { icon: 'star-outline',             label: 'Rate the App',     screen: null,       iconBg: '#FFF6E8', iconColor: '#E07B00' },
];

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const [notifications, setNotifications] = useState(true);
  const { isAdmin, logoutAdmin } = useAdmin();
  const user = auth?.currentUser;
  const isAnon = !user || user.isAnonymous;

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try { if (auth) await signOut(auth); } catch (e) { console.error(e); }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Logo bar ─────────────────────────────────────── */}
        <View style={s.logoBar}>
          <Image
            source={require('../../assets/quasar-logo.jpg')}
            style={s.logo}
            resizeMode="contain"
          />
        </View>

        {/* ── Hero header card ─────────────────────────────── */}
        <View style={s.hero}>
          {/* Avatar */}
          <View style={s.avatarWrap}>
            <View style={s.avatarRing}>
              {!isAnon && user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={s.avatarImg} />
              ) : (
                <View style={s.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color={COLORS.primary} />
                </View>
              )}
            </View>
            {!isAnon && (
              <View style={s.memberBadge}>
                <Ionicons name="shield-checkmark" size={10} color="#fff" />
                <Text style={s.memberBadgeText}>Member</Text>
              </View>
            )}
          </View>

          <Text style={s.heroName}>
            {isAnon ? 'Welcome, Guest' : (user?.displayName || user?.email?.split('@')[0] || 'User')}
          </Text>
          <Text style={s.heroEmail}>
            {isAnon ? 'Browse our luxury services' : (user?.email || '')}
          </Text>
        </View>

        {/* ── Guest sign-in prompt ──────────────────────────── */}
        {isAnon && (
          <View style={s.guestCard}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={s.guestTitle}>Sign in to unlock everything</Text>
              <Text style={s.guestSub}>Save bookings, track history & more</Text>
            </View>
            <View style={s.guestBtns}>
              <Pressable style={s.signInBtn} onPress={() => navigation.navigate('Login')}>
                <Text style={s.signInBtnText}>Sign In</Text>
              </Pressable>
              <Pressable style={s.createBtn} onPress={() => navigation.navigate('SignUp')}>
                <Text style={s.createBtnText}>Register</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ── Stats ────────────────────────────────────────── */}
        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Text style={s.statNum}>4</Text>
            <Text style={s.statLabel}>Bookings</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statNum}>2</Text>
            <Text style={s.statLabel}>Completed</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statNum}>₹13K</Text>
            <Text style={s.statLabel}>Total Spent</Text>
          </View>
        </View>

        {/* ── Menu ─────────────────────────────────────────── */}
        <Text style={s.sectionLabel}>Account</Text>
        <View style={s.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            item.isToggle ? (
              <View
                key={i}
                style={[s.menuRow, i < MENU_ITEMS.length - 1 && s.menuBorder]}
              >
                <View style={[s.iconBox, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon} size={20} color={item.iconColor} />
                </View>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor="#fff"
                />
              </View>
            ) : (
              <Pressable
                key={i}
                style={({ pressed }) => [
                  s.menuRow,
                  i < MENU_ITEMS.length - 1 && s.menuBorder,
                  pressed && s.menuRowPressed,
                ]}
                onPress={() => item.screen
                  ? navigation.navigate(item.screen)
                  : Alert.alert(item.label, 'Coming soon!')}
              >
                <View style={[s.iconBox, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon} size={20} color={item.iconColor} />
                </View>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </Pressable>
            )
          ))}
        </View>

        {/* ── Admin Portal ──────────────────────────────────── */}
        <Text style={s.sectionLabel}>Staff</Text>
        <Pressable
          style={({ pressed }) => [s.adminCard, pressed && { opacity: 0.85 }]}
          onPress={() => navigation.navigate('Admin')}
        >
          <View style={s.adminIconBox}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#E8C97A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.adminTitle}>
              Admin Portal{isAdmin ? <Text style={s.adminActiveBadge}>  ● Active</Text> : ''}
            </Text>
            <Text style={s.adminSub}>
              {isAdmin ? 'Currently in admin mode' : 'Staff & booking management'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9090B0" />
        </Pressable>

        {isAdmin && (
          <Pressable style={s.exitAdminBtn} onPress={logoutAdmin}>
            <Feather name="log-out" size={15} color="#4CAF50" style={{ marginRight: 8 }} />
            <Text style={s.exitAdminText}>Exit Admin Mode</Text>
          </Pressable>
        )}

        {/* ── Sign Out ─────────────────────────────────────── */}
        {!isAnon && (
          <Pressable style={s.signOutBtn} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={18} color={COLORS.error} style={{ marginRight: 8 }} />
            <Text style={s.signOutText}>Sign Out</Text>
          </Pressable>
        )}

        <Text style={s.version}>Quasar Salon · v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const HERO_BG = '#1A1209';

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  /* Logo bar */
  logoBar: {
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logo: { width: 120, height: 36 },

  /* Hero */
  hero: {
    backgroundColor: HERO_BG,
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatarWrap: { alignItems: 'center', marginBottom: 14 },
  avatarRing: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 2.5, borderColor: COLORS.primary,
    overflow: 'hidden',
    backgroundColor: '#2A1E0A',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarImg: { width: 96, height: 96 },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  memberBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 20, marginTop: 8,
  },
  memberBadgeText: { fontSize: 11, color: '#fff', fontWeight: '700', letterSpacing: 0.5 },
  heroName: { fontSize: 22, fontWeight: '800', color: '#F5F0E8', letterSpacing: 0.3 },
  heroEmail: { fontSize: 13, color: '#9C8878', marginTop: 4 },

  /* Guest card */
  guestCard: {
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
    backgroundColor: COLORS.bgCard, marginHorizontal: 20, marginTop: 16,
    borderRadius: RADIUS.lg, padding: 16, gap: 10,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOW.card,
  },
  guestTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  guestSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  guestBtns: { flexDirection: 'row', gap: 8, marginTop: 4 },
  signInBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 18, paddingVertical: 8, borderRadius: RADIUS.md },
  signInBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  createBtn: { borderWidth: 1.5, borderColor: COLORS.primary, paddingHorizontal: 18, paddingVertical: 8, borderRadius: RADIUS.md },
  createBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },

  /* Stats */
  statsRow: {
    flexDirection: 'row', backgroundColor: COLORS.bgCard,
    marginHorizontal: 20, marginTop: 16,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border,
    overflow: 'hidden', ...SHADOW.card,
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statNum: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 3, letterSpacing: 0.3 },
  statDivider: { width: 1, backgroundColor: COLORS.border, marginVertical: 12 },

  /* Section label */
  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.2,
    color: COLORS.textMuted, textTransform: 'uppercase',
    marginHorizontal: 24, marginTop: 28, marginBottom: 8,
  },

  /* Menu */
  menuCard: {
    backgroundColor: COLORS.bgCard, marginHorizontal: 20,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border,
    overflow: 'hidden', ...SHADOW.card,
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 14,
  },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  menuRowPressed: { backgroundColor: COLORS.bgElevated },
  iconBox: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '500' },

  /* Admin */
  adminCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: 20, backgroundColor: '#12100C',
    borderRadius: RADIUS.lg, padding: 16, borderWidth: 1, borderColor: '#2E2615',
  },
  adminIconBox: {
    width: 42, height: 42, borderRadius: 11,
    backgroundColor: '#2A1E0A', alignItems: 'center', justifyContent: 'center',
  },
  adminTitle: { fontSize: 15, fontWeight: '700', color: '#E8C97A' },
  adminActiveBadge: { fontSize: 13, color: '#4CAF50' },
  adminSub: { fontSize: 12, color: '#9090B0', marginTop: 2 },
  exitAdminBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 20, marginTop: 10,
    borderWidth: 1.5, borderColor: '#4CAF50',
    borderRadius: RADIUS.lg, padding: 12,
  },
  exitAdminText: { color: '#4CAF50', fontWeight: '700', fontSize: 14 },

  /* Sign out */
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 20, marginTop: 24,
    borderWidth: 1.5, borderColor: COLORS.error,
    borderRadius: RADIUS.lg, padding: 15,
  },
  signOutText: { color: COLORS.error, fontWeight: '700', fontSize: 15 },

  version: {
    textAlign: 'center', color: COLORS.textMuted,
    fontSize: 12, marginTop: 28, letterSpacing: 0.8,
  },
});
