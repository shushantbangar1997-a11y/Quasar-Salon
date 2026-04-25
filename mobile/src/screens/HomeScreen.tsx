import React from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  SafeAreaView, StatusBar, Image,
} from 'react-native';
import { QUASAR_CATEGORIES } from '../quasarData';
import { useCart } from '../CartContext';
import { COLORS, RADIUS } from '../theme';
import { HomeScreenProps } from '../navigation';

const POPULAR = [
  { catId: 'hair-care', svcId: 'hc-8', label: "Men's Haircut", price: 599, icon: '✂️' },
  { catId: 'facials', svcId: 'fa-2', label: 'Red Wine Facial', price: 3999, icon: '🍷' },
  { catId: 'nails', svcId: 'na-4', label: 'Gel Polish', price: 999, icon: '💅' },
  { catId: 'massages', svcId: 'ms-1', label: 'Head Massage', price: 1000, icon: '💆' },
  { catId: 'makeup', svcId: 'mu-3', label: 'HD Make-Up', price: 4499, icon: '💄' },
  { catId: 'body', svcId: 'bd-1', label: 'Swedish Therapy', price: 2500, icon: '🛁' },
];

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { totalItems, totalPrice } = useCart();

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: totalItems > 0 ? 100 : 40 }}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.tagline}>Welcome to</Text>
            <Image
              source={require('../../assets/quasar-logo.jpg')}
              style={s.logo}
              resizeMode="contain"
            />
          </View>
          <Pressable style={s.profileBtn} onPress={() => navigation.navigate('Profile')}>
            <Text style={{ fontSize: 20 }}>👤</Text>
          </Pressable>
        </View>

        {/* Hero banner */}
        <View style={s.hero}>
          <Text style={s.heroTitle}>Book Your Luxury{'\n'}Experience</Text>
          <Text style={s.heroSub}>Premium salon services, crafted for you</Text>
          <Pressable style={s.heroCta} onPress={() => navigation.navigate('Search')}>
            <Text style={s.heroCtaText}>Explore Services</Text>
          </Pressable>
        </View>

        {/* Service categories */}
        <Text style={s.sectionTitle}>Our Services</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}>
          {QUASAR_CATEGORIES.map(cat => (
            <Pressable
              key={cat.id}
              style={s.catCard}
              onPress={() => navigation.navigate('Category', { category: cat })}
            >
              <Text style={s.catIcon}>{cat.icon}</Text>
              <Text style={s.catName} numberOfLines={2}>{cat.name}</Text>
              <Text style={s.catCount}>{cat.services.length} services</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Popular picks */}
        <Text style={s.sectionTitle}>Popular Picks</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}>
          {POPULAR.map(p => {
            const cat = QUASAR_CATEGORIES.find(c => c.id === p.catId)!;
            return (
              <Pressable
                key={p.svcId}
                style={s.popularCard}
                onPress={() => navigation.navigate('Category', { category: cat })}
              >
                <View style={s.popularIconWrap}>
                  <Text style={{ fontSize: 28 }}>{p.icon}</Text>
                </View>
                <Text style={s.popularName} numberOfLines={2}>{p.label}</Text>
                <Text style={s.popularPrice}>₹{p.price.toLocaleString('en-IN')}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Footer tagline */}
        <View style={s.footer}>
          <Text style={s.footerText}>✦ Premium · Luxury · Bespoke ✦</Text>
        </View>
      </ScrollView>

      {/* Floating cart bar */}
      {totalItems > 0 && (
        <Pressable style={s.cartBar} onPress={() => navigation.navigate('Cart')}>
          <View style={s.cartBadge}>
            <Text style={s.cartBadgeText}>{totalItems}</Text>
          </View>
          <Text style={s.cartBarLabel}>{totalItems} service{totalItems > 1 ? 's' : ''} selected</Text>
          <Text style={s.cartBarPrice}>₹{totalPrice.toLocaleString('en-IN')} →</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  tagline: { fontSize: 12, color: COLORS.textMuted, letterSpacing: 2, textTransform: 'uppercase' },
  logo: { width: 160, height: 48 },
  profileBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  hero: { marginHorizontal: 20, marginTop: 16, marginBottom: 8, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: 24, borderWidth: 1, borderColor: COLORS.primaryDim },
  heroTitle: { fontSize: 26, fontWeight: '800', color: COLORS.text, lineHeight: 34 },
  heroSub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 6 },
  heroCta: { marginTop: 18, alignSelf: 'flex-start', backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: RADIUS.md },
  heroCtaText: { color: COLORS.bg, fontWeight: '700', fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, paddingHorizontal: 20, marginTop: 28, marginBottom: 14 },
  catCard: { width: 90, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 14, marginRight: 10, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  catIcon: { fontSize: 28, marginBottom: 8 },
  catName: { fontSize: 12, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  catCount: { fontSize: 10, color: COLORS.primary, marginTop: 4 },
  popularCard: { width: 140, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 14, marginRight: 12, borderWidth: 1, borderColor: COLORS.border },
  popularIconWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.primaryDim, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  popularName: { fontSize: 13, fontWeight: '600', color: COLORS.text, lineHeight: 18 },
  popularPrice: { fontSize: 13, fontWeight: '700', color: COLORS.primary, marginTop: 6 },
  footer: { alignItems: 'center', marginTop: 32, marginBottom: 8 },
  footerText: { fontSize: 12, color: COLORS.textMuted, letterSpacing: 1 },
  cartBar: { position: 'absolute', bottom: 12, left: 20, right: 20, backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, shadowColor: COLORS.primary, shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  cartBadge: { backgroundColor: COLORS.bg, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cartBadgeText: { fontSize: 12, fontWeight: '800', color: COLORS.primary },
  cartBarLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.bg },
  cartBarPrice: { fontSize: 14, fontWeight: '800', color: COLORS.bg },
});
