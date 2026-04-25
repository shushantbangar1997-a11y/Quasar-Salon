import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, StatusBar, Alert, Switch, Image } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { COLORS, RADIUS } from '../theme';
import { ProfileScreenProps } from '../navigation';
import { useAdmin } from '../AdminContext';

const MENU_ITEMS: { icon: string; label: string; screen: 'Bookings' | null; isToggle?: boolean }[] = [
  { icon: '📅', label: 'My Bookings', screen: 'Bookings' },
  { icon: '💳', label: 'Payment Methods', screen: null },
  { icon: '🔔', label: 'Notifications', screen: null, isToggle: true },
  { icon: '❓', label: 'Help & Support', screen: null },
  { icon: '⭐', label: 'Rate the App', screen: null },
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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Logo header */}
        <View style={s.logoBar}>
          <Image
            source={require('../../assets/quasar-logo.jpg')}
            style={s.logo}
            resizeMode="contain"
          />
        </View>

        {/* Profile card */}
        <View style={s.profileCard}>
          <View style={s.avatarCircle}>
            <Text style={{ fontSize: 40 }}>👤</Text>
          </View>
          <Text style={s.name}>{isAnon ? 'Guest' : (user?.displayName || user?.email || 'User')}</Text>
          <Text style={s.email}>{isAnon ? 'Browsing as guest' : (user?.email || '')}</Text>

          {isAnon && (
            <View style={s.anonBanner}>
              <Text style={s.anonText}>Sign in to save bookings and access all features</Text>
              <View style={s.anonBtns}>
                <Pressable style={s.signInBtn} onPress={() => navigation.navigate('Login')}>
                  <Text style={s.signInBtnText}>Sign In</Text>
                </Pressable>
                <Pressable style={s.createBtn} onPress={() => navigation.navigate('SignUp')}>
                  <Text style={s.createBtnText}>Create Account</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Stats */}
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
            <Text style={s.statLabel}>Spent</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={s.menu}>
          {MENU_ITEMS.map((item, i) => (
            item.isToggle ? (
              <View key={i} style={[s.menuItem, i === MENU_ITEMS.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={s.menuIcon}>{item.icon}</Text>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: COLORS.bgElevated, true: COLORS.primary }}
                  thumbColor={COLORS.text}
                />
              </View>
            ) : (
              <Pressable
                key={i}
                style={[s.menuItem, i === MENU_ITEMS.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => item.screen ? navigation.navigate(item.screen) : Alert.alert(item.label, 'Coming soon!')}
              >
                <Text style={s.menuIcon}>{item.icon}</Text>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 18 }}>›</Text>
              </Pressable>
            )
          ))}
        </View>

        {/* Admin Portal */}
        <Pressable
          style={s.adminPortalBtn}
          onPress={() => navigation.navigate('Admin')}
        >
          <Text style={s.adminPortalIcon}>🔐</Text>
          <View style={s.adminPortalInfo}>
            <Text style={s.adminPortalTitle}>
              Admin Portal {isAdmin && <Text style={s.adminBadge}> Active</Text>}
            </Text>
            <Text style={s.adminPortalSub}>
              {isAdmin ? 'Currently in admin mode — tap to open' : 'Staff & booking management'}
            </Text>
          </View>
          <Text style={{ color: COLORS.textMuted, fontSize: 18 }}>›</Text>
        </Pressable>

        {isAdmin && (
          <Pressable style={s.adminLogoutBtn} onPress={logoutAdmin}>
            <Text style={s.adminLogoutText}>Exit Admin Mode</Text>
          </Pressable>
        )}

        {!isAnon && (
          <Pressable style={s.signOutBtn} onPress={handleSignOut}>
            <Text style={s.signOutText}>Sign Out</Text>
          </Pressable>
        )}

        <Text style={s.version}>Quasar Salon v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  logoBar: { backgroundColor: COLORS.bgCard, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  logo: { width: 120, height: 36 },
  profileCard: { backgroundColor: COLORS.bgCard, alignItems: 'center', padding: 28, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  avatarCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.primaryDim, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.primary },
  name: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginTop: 14 },
  email: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  anonBanner: { backgroundColor: COLORS.primaryDim, borderRadius: RADIUS.lg, padding: 16, marginTop: 16, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  anonText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
  anonBtns: { flexDirection: 'row', gap: 10, marginTop: 12 },
  signInBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 9, borderRadius: RADIUS.md },
  signInBtnText: { color: COLORS.bg, fontWeight: '700', fontSize: 13 },
  createBtn: { borderWidth: 1.5, borderColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 9, borderRadius: RADIUS.md },
  createBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  statsRow: { flexDirection: 'row', backgroundColor: COLORS.bgCard, marginHorizontal: 20, marginTop: 16, borderRadius: RADIUS.lg, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  menu: { backgroundColor: COLORS.bgCard, marginHorizontal: 20, marginTop: 20, borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuIcon: { fontSize: 20, marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 15, color: COLORS.text },
  signOutBtn: { marginHorizontal: 20, marginTop: 20, borderWidth: 1.5, borderColor: COLORS.error, borderRadius: RADIUS.lg, padding: 16, alignItems: 'center' },
  signOutText: { color: COLORS.error, fontWeight: '700', fontSize: 15 },
  version: { textAlign: 'center', color: COLORS.textMuted, fontSize: 12, marginTop: 16, marginBottom: 30, letterSpacing: 0.5 },
  adminPortalBtn: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 20, backgroundColor: '#1A1A2E', borderRadius: RADIUS.lg, padding: 16, gap: 12 },
  adminPortalIcon: { fontSize: 22 },
  adminPortalInfo: { flex: 1 },
  adminPortalTitle: { fontSize: 15, fontWeight: '700', color: '#E8C97A' },
  adminBadge: { color: '#4CAF50', fontSize: 13 },
  adminPortalSub: { fontSize: 12, color: '#9090B0', marginTop: 2 },
  adminLogoutBtn: { marginHorizontal: 20, marginTop: 10, borderWidth: 1.5, borderColor: '#4CAF50', borderRadius: RADIUS.lg, padding: 12, alignItems: 'center' },
  adminLogoutText: { color: '#4CAF50', fontWeight: '700', fontSize: 14 },
});
