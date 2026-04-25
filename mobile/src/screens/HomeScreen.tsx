import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, Pressable,
  StyleSheet, FlatList, SafeAreaView, StatusBar,
} from 'react-native';
import { DEMO_PROVIDERS, CATEGORIES } from '../demoData';

const COLORS = {
  primary: '#E91E8C',
  bg: '#F8F9FA',
  card: '#FFFFFF',
  text: '#1A1A2E',
  muted: '#8E8E93',
  border: '#F0F0F0',
  tag: '#FFF0F7',
  tagText: '#E91E8C',
};

export default function HomeScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = DEMO_PROVIDERS.filter(p => {
    const matchCategory = activeCategory === 'All' || p.categories.includes(activeCategory);
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.categories.some(c => c.toLowerCase().includes(search.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const featured = DEMO_PROVIDERS.slice(0, 3);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.headline}>Find your beauty pro</Text>
          </View>
          <Pressable style={styles.avatar}>
            <Text style={{ fontSize: 20 }}>👤</Text>
          </Pressable>
        </View>

        {/* Search bar */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or service..."
            placeholderTextColor={COLORS.muted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow} contentContainerStyle={{ paddingRight: 16 }}>
          {CATEGORIES.map(cat => (
            <Pressable
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
            >
              <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Featured */}
        {search === '' && activeCategory === 'All' && (
          <>
            <Text style={styles.sectionTitle}>⭐ Top Rated</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
              {featured.map(p => (
                <Pressable key={p.id} style={styles.featuredCard} onPress={() => navigation.navigate('ProviderDetail', { provider: p })}>
                  <View style={styles.featuredEmoji}>
                    <Text style={{ fontSize: 40 }}>{p.emoji}</Text>
                  </View>
                  <Text style={styles.featuredName} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.featuredCat}>{p.categories[0]}</Text>
                  <View style={styles.ratingRow}>
                    <Text style={styles.star}>⭐</Text>
                    <Text style={styles.ratingText}>{p.rating} ({p.reviewCount})</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}

        {/* All / Filtered providers */}
        <Text style={styles.sectionTitle}>
          {activeCategory === 'All' && search === '' ? '📍 Near You' : `Results (${filtered.length})`}
        </Text>
        {filtered.map(p => (
          <Pressable key={p.id} style={styles.listCard} onPress={() => navigation.navigate('ProviderDetail', { provider: p })}>
            <View style={styles.listEmoji}>
              <Text style={{ fontSize: 32 }}>{p.emoji}</Text>
            </View>
            <View style={styles.listInfo}>
              <Text style={styles.listName}>{p.name}</Text>
              <Text style={styles.listCat}>{p.categories.join(' · ')}</Text>
              <Text style={styles.listCity}>📍 {p.location.city}</Text>
              <View style={styles.listBottom}>
                <Text style={styles.listRating}>⭐ {p.rating} ({p.reviewCount})</Text>
                <Text style={styles.listPrice}>From ${Math.min(...p.services.map(s => s.price))}</Text>
              </View>
            </View>
          </Pressable>
        ))}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  greeting: { fontSize: 14, color: COLORS.muted },
  headline: { fontSize: 26, fontWeight: '700', color: COLORS.text, marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.tag, alignItems: 'center', justifyContent: 'center' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, marginHorizontal: 20, marginVertical: 12, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  searchIcon: { fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text },
  categoriesRow: { paddingLeft: 20, marginBottom: 8 },
  catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.card, marginRight: 8, borderWidth: 1, borderColor: COLORS.border },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { fontSize: 13, color: COLORS.muted, fontWeight: '500' },
  catTextActive: { color: '#fff' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, paddingHorizontal: 20, marginTop: 16, marginBottom: 12 },
  featuredCard: { width: 160, backgroundColor: COLORS.card, borderRadius: 18, padding: 14, marginLeft: 20, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 3, marginBottom: 4 },
  featuredEmoji: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.tag, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  featuredName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  featuredCat: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  star: { fontSize: 12 },
  ratingText: { fontSize: 12, color: COLORS.muted, marginLeft: 3 },
  listCard: { flexDirection: 'row', backgroundColor: COLORS.card, marginHorizontal: 20, marginBottom: 12, borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  listEmoji: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.tag, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  listInfo: { flex: 1 },
  listName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  listCat: { fontSize: 13, color: COLORS.primary, marginTop: 2 },
  listCity: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  listBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  listRating: { fontSize: 12, color: COLORS.muted },
  listPrice: { fontSize: 13, fontWeight: '600', color: COLORS.text },
});
