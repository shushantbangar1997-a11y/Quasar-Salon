import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, Alert, Switch } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const P = '#E91E8C';

const MENU_ITEMS = [
  { icon: '📅', label: 'My Bookings', screen: 'Bookings' },
  { icon: '❤️', label: 'Saved Providers', screen: null },
  { icon: '💳', label: 'Payment Methods', screen: null },
  { icon: '🔔', label: 'Notifications', screen: null },
  { icon: '❓', label: 'Help & Support', screen: null },
  { icon: '⭐', label: 'Rate the App', screen: null },
];

export default function ProfileScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState(true);
  const user = auth?.currentUser;
  const isAnon = !user || user.isAnonymous;

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive', onPress: async () => {
          try {
            if (auth) await signOut(auth);
          } catch (e) {
            console.error(e);
          }
        }
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <View style={s.profileCard}>
          <View style={s.avatarCircle}>
            <Text style={{ fontSize: 44 }}>👤</Text>
          </View>
          <Text style={s.name}>{isAnon ? 'Guest User' : (user?.displayName || user?.email || 'User')}</Text>
          <Text style={s.email}>{isAnon ? 'Browsing as guest' : (user?.email || '')}</Text>

          {isAnon && (
            <View style={s.anonBanner}>
              <Text style={s.anonText}>Sign in to save bookings and access all features</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <Pressable style={s.signInBtn} onPress={() => navigation.navigate('Login')}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Sign In</Text>
                </Pressable>
                <Pressable style={s.createAccBtn} onPress={() => navigation.navigate('SignUp')}>
                  <Text style={{ color: P, fontWeight: '700', fontSize: 13 }}>Create Account</Text>
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
            <Text style={s.statLabel}>Saved</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statNum}>3</Text>
            <Text style={s.statLabel}>Reviews</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={s.menu}>
          {MENU_ITEMS.map((item, i) => (
            item.label === 'Notifications' ? (
              <View key={i} style={[s.menuItem, i === MENU_ITEMS.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={s.menuIcon}>{item.icon}</Text>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: '#E5E5EA', true: P }}
                  thumbColor="#fff"
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
                <Text style={{ color: '#C7C7CC', fontSize: 18 }}>›</Text>
              </Pressable>
            )
          ))}
        </View>

        {!isAnon && (
          <Pressable style={s.signOutBtn} onPress={handleSignOut}>
            <Text style={s.signOutText}>Sign Out</Text>
          </Pressable>
        )}

        <Text style={{ textAlign: 'center', color: '#C7C7CC', fontSize: 12, marginTop: 16, marginBottom: 30 }}>
          BeautyBooking v1.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  profileCard: { backgroundColor: '#fff', alignItems: 'center', padding: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#FFF0F7', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: P },
  name: { fontSize: 22, fontWeight: '800', color: '#1A1A2E', marginTop: 14 },
  email: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  anonBanner: { backgroundColor: '#FFF0F7', borderRadius: 14, padding: 16, marginTop: 16, width: '100%', alignItems: 'center' },
  anonText: { fontSize: 13, color: '#6B6B7B', textAlign: 'center' },
  signInBtn: { backgroundColor: P, paddingHorizontal: 20, paddingVertical: 9, borderRadius: 10 },
  createAccBtn: { borderWidth: 1.5, borderColor: P, paddingHorizontal: 20, paddingVertical: 9, borderRadius: 10 },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 20, marginTop: 16, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800', color: P },
  statLabel: { fontSize: 12, color: '#8E8E93', marginTop: 4 },
  statDivider: { width: 1, backgroundColor: '#F0F0F0' },
  menu: { backgroundColor: '#fff', marginHorizontal: 20, marginTop: 20, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F8F8F8' },
  menuIcon: { fontSize: 20, marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 15, color: '#1A1A2E' },
  signOutBtn: { marginHorizontal: 20, marginTop: 20, borderWidth: 1.5, borderColor: '#FFCDD2', borderRadius: 14, padding: 16, alignItems: 'center' },
  signOutText: { color: '#C62828', fontWeight: '700', fontSize: 15 },
});
