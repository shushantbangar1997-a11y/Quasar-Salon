import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  SafeAreaView, StatusBar, Image,
} from 'react-native';

import { QUASAR_CATEGORIES, QuasarCategory } from '../quasarData';
import { useCart } from '../CartContext';
import { COLORS, RADIUS } from '../theme';
import { HomeScreenProps } from '../navigation';
import CategoryCarousel from '../components/CategoryCarousel';
import { Skeleton, SkeletonImage, isRemoteImageSource } from '../components/Skeleton';

const POPULAR = [
  { catId: 'hair-care', svcId: 'hc-8', label: "Men's Haircut", price: 599 },
  { catId: 'facials', svcId: 'fa-2', label: 'Red Wine Facial', price: 3999 },
  { catId: 'nails', svcId: 'na-4', label: 'Gel Polish', price: 999 },
  { catId: 'massages', svcId: 'ms-1', label: 'Head Massage', price: 1000 },
  { catId: 'makeup', svcId: 'mu-3', label: 'HD Make-Up', price: 4499 },
  { catId: 'body', svcId: 'bd-1', label: 'Swedish Therapy', price: 2500 },
];

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { totalItems, totalPrice } = useCart();

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: totalItems > 0 ? 100 : 40 }}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.logoRow}>
            <Image
              source={require('../../assets/quasar-logo-new.png')}
              style={s.topLogo}
              resizeMode="contain"
            />
            <Text style={s.logoTagline}>Luxury Salon</Text>
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

        {/* Service categories carousel */}
        <Text style={s.sectionTitle}>Our Services</Text>
        <CategoryCarousel
          categories={QUASAR_CATEGORIES}
          onSelect={cat => navigation.navigate('Category', { category: cat })}
        />

        {/* Popular picks */}
        <Text style={s.sectionTitle}>Popular Picks</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}>
          {POPULAR.map(p => {
            const cat = QUASAR_CATEGORIES.find(c => c.id === p.catId)!;
            return (
              <PopularCard
                key={p.svcId}
                cat={cat}
                label={p.label}
                price={p.price}
                onPress={() => navigation.navigate('Category', { category: cat })}
              />
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

function PopularCard({
  cat,
  label,
  price,
  onPress,
}: {
  cat: QuasarCategory;
  label: string;
  price: number;
  onPress: () => void;
}) {
  const source = typeof cat.imageUrl === 'string' ? { uri: cat.imageUrl } : cat.imageUrl;
  const remote = isRemoteImageSource(source);
  const [ready, setReady] = useState(!remote);

  return (
    <Pressable style={s.popularCard} onPress={onPress}>
      <SkeletonImage
        source={source}
        style={s.popularImage}
        resizeMode="cover"
        onLoad={() => setReady(true)}
        onError={() => setReady(true)}
        fallback={
          <View style={s.popularFallback}>
            <Text style={s.popularFallbackIcon}>{cat.icon}</Text>
          </View>
        }
      />
      {ready ? (
        <>
          <Text style={s.popularName} numberOfLines={2}>{label}</Text>
          <Text style={s.popularPrice}>₹{price.toLocaleString('en-IN')}</Text>
        </>
      ) : (
        <View style={s.popularTextSkeletons}>
          <Skeleton width={110} height={12} radius={4} />
          <Skeleton width={70} height={12} radius={4} style={{ marginTop: 8 }} />
        </View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topLogo: { width: 48, height: 48 },
  logoTagline: { fontSize: 11, color: COLORS.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: '600' },
  profileBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  hero: { marginHorizontal: 20, marginTop: 8, marginBottom: 8, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: 24, borderWidth: 1, borderColor: COLORS.primaryDim },
  heroTitle: { fontSize: 26, fontWeight: '800', color: COLORS.text, lineHeight: 34 },
  heroSub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 6 },
  heroCta: { marginTop: 18, alignSelf: 'flex-start', backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: RADIUS.md },
  heroCtaText: { color: COLORS.bg, fontWeight: '700', fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, paddingHorizontal: 20, marginTop: 28, marginBottom: 14 },
  popularCard: { width: 148, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, overflow: 'hidden', marginRight: 12, borderWidth: 1, borderColor: COLORS.border },
  popularImage: { width: '100%', height: 90, backgroundColor: COLORS.bgElevated },
  popularFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bgElevated },
  popularFallbackIcon: { fontSize: 32, opacity: 0.7 },
  popularName: { fontSize: 13, fontWeight: '600', color: COLORS.text, lineHeight: 18, paddingHorizontal: 10, paddingTop: 8 },
  popularPrice: { fontSize: 13, fontWeight: '700', color: COLORS.primary, paddingHorizontal: 10, paddingBottom: 10, marginTop: 4 },
  popularTextSkeletons: { paddingHorizontal: 10, paddingTop: 10, paddingBottom: 12 },
  footer: { alignItems: 'center', marginTop: 32, marginBottom: 8 },
  footerText: { fontSize: 12, color: COLORS.textMuted, letterSpacing: 1 },
  cartBar: { position: 'absolute', bottom: 12, left: 20, right: 20, backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, shadowColor: COLORS.primary, shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  cartBadge: { backgroundColor: COLORS.bg, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cartBadgeText: { fontSize: 12, fontWeight: '800', color: COLORS.primary },
  cartBarLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.bg },
  cartBarPrice: { fontSize: 14, fontWeight: '800', color: COLORS.bg },
});
