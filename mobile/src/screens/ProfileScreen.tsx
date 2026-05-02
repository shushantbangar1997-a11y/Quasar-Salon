import React from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  SafeAreaView, StatusBar, Alert, Image,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { COLORS, RADIUS, SHADOW } from '../theme';
import { ProfileScreenProps, RootStackParamList } from '../navigation';
import { useAdmin } from '../AdminContext';
import { useBookings } from '../BookingsContext';
import { logger } from '../logger';

type MenuRow = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  screen: keyof RootStackParamList | 'Bookings';
  iconBg: string;
  iconColor: string;
  destructive?: boolean;
};

const MENU_ITEMS: MenuRow[] = [
  { icon: 'calendar-outline',     label: 'My Bookings',    screen: 'Bookings',     iconBg: '#FDF6E8', iconColor: COLORS.primary },
  { icon: 'person-outline',       label: 'Edit Profile',   screen: 'EditProfile',  iconBg: '#EAF4F0', iconColor: '#2E7D60' },
  { icon: 'help-circle-outline',  label: 'Help & Contact', screen: 'HelpContact',  iconBg: '#F3EEFB', iconColor: '#7B3FD4' },
  { icon: 'shield-outline',       label: 'Privacy Policy', screen: 'PrivacyPolicy', iconBg: '#EBF0FB', iconColor: '#3B6CC9' },
  { icon: 'document-text-outline', label: 'Terms of Service', screen: 'Terms',     iconBg: '#FFF6E8', iconColor: '#E07B00' },
  { icon: 'trash-outline',        label: 'Delete Account', screen: 'DeleteAccount', iconBg: '#FDECEC', iconColor: COLORS.error, destructive: true },
];

function formatINR(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { isAdmin, logoutAdmin } = useAdmin();
  const { bookings } = useBookings();
  const user = auth?.currentUser;
  const isAnon = !user || user.isAnonymous;

  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const totalSpent = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + (b.total || 0), 0);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try { if (auth) await signOut(auth); } catch (e) { logger.error(e); }
        },
      },
    ]);
  };

  const handleMenuPress = (item: MenuRow) => {
    if (item.screen === 'Bookings') {
      navigation.navigate('MainTabs', { screen: 'Bookings' });
      return;
    }
    if ((item.screen === 'EditProfile' || item.screen === 'DeleteAccount') && isAnon) {
      Alert.alert('Sign in required', 'Please sign in or create an account to continue.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }
    switch (item.screen) {
      case 'EditProfile': navigation.navigate('EditProfile'); return;
      case 'HelpContact': navigation.navigate('HelpContact'); return;
      case 'PrivacyPolicy': navigation.navigate('PrivacyPolicy'); return;
      case 'Terms': navigation.navigate('Terms'); return;
      case 'DeleteAccount': navigation.navigate('DeleteAccount'); return;
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={s.logoBar}>
          <Image
            source={require('../../assets/quasar-logo-transparent.png')}
            style={s.logo}
            resizeMode="contain"
          />
        </View>

        <View style={s.hero}>
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

        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Text style={s.statNum}>{totalBookings}</Text>
            <Text style={s.statLabel}>Bookings</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statNum}>{completedBookings}</Text>
            <Text style={s.statLabel}>Completed</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statNum}>{formatINR(totalSpent)}</Text>
            <Text style={s.statLabel}>Total Spent</Text>
          </View>
        </View>

        <Text style={s.sectionLabel}>Account</Text>
        <View style={s.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                s.menuRow,
                i < MENU_ITEMS.length - 1 && s.menuBorder,
                pressed && s.menuRowPressed,
              ]}
              onPress={() => handleMenuPress(item)}
            >
              <View style={[s.iconBox, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon} size={20} color={item.iconColor} />
              </View>
              <Text style={[s.menuLabel, item.destructive && { color: COLORS.error }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </Pressable>
          ))}
        </View>

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
  logoBar: { backgroundColor: COLORS.bgCard, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  logo: { width: 120, height: 36 },
  hero: { backgroundColor: HERO_BG, alignItems: 'center', paddingTop: 28, paddingBottom: 32, paddingHorizontal: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  avatarWrap: { alignItems: 'center', marginBottom: 14 },
  avatarRing: { width: 96, height: 96, borderRadius: 48, borderWidth: 2.5, borderColor: COLORS.primary, overflow: 'hidden', backgroundColor: '#2A1E0A', alignItems: 'center', justifyContent: 'center' },
  avatarImg: { width: 96, height: 96 },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  memberBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginTop: 8 },
  memberBadgeText: { fontSize: 11, color: '#fff', fontWeight: '700', letterSpacing: 0.5 },
  heroName: { fontSize: 22, fontWeight: '800', color: '#F5F0E8', letterSpacing: 0.3 },
  heroEmail: { fontSize: 13, color: '#9C8878', marginTop: 4 },
  guestCard: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', backgroundColor: COLORS.bgCard, marginHorizontal: 20, marginTop: 16, borderRadius: RADIUS.lg, padding: 16, gap: 10, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.card },
  guestTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  guestSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  guestBtns: { flexDirection: 'row', gap: 8, marginTop: 4 },
  signInBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 18, paddingVertical: 8, borderRadius: RADIUS.md },
  signInBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  createBtn: { borderWidth: 1.5, borderColor: COLORS.primary, paddingHorizontal: 18, paddingVertical: 8, borderRadius: RADIUS.md },
  createBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  statsRow: { flexDirection: 'row', backgroundColor: COLORS.bgCard, marginHorizontal: 20, marginTop: 16, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', ...SHADOW.card },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statNum: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 3, letterSpacing: 0.3 },
  statDivider: { width: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: COLORS.textMuted, textTransform: 'uppercase', marginHorizontal: 24, marginTop: 28, marginBottom: 8 },
  menuCard: { backgroundColor: COLORS.bgCard, marginHorizontal: 20, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', ...SHADOW.card },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  menuRowPressed: { backgroundColor: COLORS.bgElevated },
  iconBox: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '500' },
  adminCard: { flexDirection: 'row', alignItems: 'center', gap: 14, marginHorizontal: 20, backgroundColor: '#12100C', borderRadius: RADIUS.lg, padding: 16, borderWidth: 1, borderColor: '#2E2615' },
  adminIconBox: { width: 42, height: 42, borderRadius: 11, backgroundColor: '#2A1E0A', alignItems: 'center', justifyContent: 'center' },
  adminTitle: { fontSize: 15, fontWeight: '700', color: '#E8C97A' },
  adminActiveBadge: { fontSize: 13, color: '#4CAF50' },
  adminSub: { fontSize: 12, color: '#9090B0', marginTop: 2 },
  exitAdminBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginTop: 10, borderWidth: 1.5, borderColor: '#4CAF50', borderRadius: RADIUS.lg, padding: 12 },
  exitAdminText: { color: '#4CAF50', fontWeight: '700', fontSize: 14 },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginTop: 24, borderWidth: 1.5, borderColor: COLORS.error, borderRadius: RADIUS.lg, padding: 15 },
  signOutText: { color: COLORS.error, fontWeight: '700', fontSize: 15 },
  version: { textAlign: 'center', color: COLORS.textMuted, fontSize: 12, marginTop: 28, letterSpacing: 0.8 },
});
