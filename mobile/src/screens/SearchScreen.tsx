import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { DEMO_PROVIDERS, CATEGORIES } from '../demoData';

const P = '#E91E8C';

export default function SearchScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'rating' | 'price'>('rating');

  let results = DEMO_PROVIDERS.filter(p => {
    const matchCat = activeCategory === 'All' || p.categories.includes(activeCategory);
    const q = query.toLowerCase();
    const matchQuery = !q || p.name.toLowerCase().includes(q) || p.categories.some(c => c.toLowerCase().includes(q)) || p.bio.toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  if (sortBy === 'rating') results = [...results].sort((a, b) => b.rating - a.rating);
  if (sortBy === 'price') results = [...results].sort((a, b) => Math.min(...a.services.map(s => s.price)) - Math.min(...b.services.map(s => s.price)));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <View style={s.header}>
        <Text style={s.title}>Search</Text>
        <View style={s.searchBox}>
          <Text style={{ fontSize: 18, marginRight: 8 }}>🔍</Text>
          <TextInput
            style={s.input}
            placeholder="Search by name, service, or category..."
            placeholderTextColor="#aaa"
            value={query}
            onChangeText={setQuery}
            autoFocus={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Text style={{ color: '#aaa', fontSize: 18 }}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={s.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 12 }}>
          {CATEGORIES.map(cat => (
            <Pressable key={cat} onPress={() => setActiveCategory(cat)} style={[s.catChip, activeCategory === cat && s.catChipActive]}>
              <Text style={[s.catText, activeCategory === cat && s.catTextActive]}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={s.sortRow}>
        <Text style={{ color: '#8E8E93', fontSize: 13 }}>{results.length} result{results.length !== 1 ? 's' : ''}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable onPress={() => setSortBy('rating')} style={[s.sortBtn, sortBy === 'rating' && s.sortBtnActive]}>
            <Text style={[s.sortText, sortBy === 'rating' && { color: P }]}>⭐ Rating</Text>
          </Pressable>
          <Pressable onPress={() => setSortBy('price')} style={[s.sortBtn, sortBy === 'price' && s.sortBtnActive]}>
            <Text style={[s.sortText, sortBy === 'price' && { color: P }]}>💲 Price</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
        {results.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 40 }}>🔍</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A1A2E', marginTop: 12 }}>No results found</Text>
            <Text style={{ color: '#8E8E93', marginTop: 6 }}>Try a different search or category</Text>
          </View>
        ) : (
          results.map(p => (
            <Pressable key={p.id} style={s.card} onPress={() => navigation.navigate('ProviderDetail', { provider: p })}>
              <View style={s.cardEmoji}>
                <Text style={{ fontSize: 32 }}>{p.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.cardName}>{p.name}</Text>
                <Text style={s.cardCat}>{p.categories.join(' · ')}</Text>
                <Text style={s.cardCity}>📍 {p.location.city}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                  <Text style={s.cardRating}>⭐ {p.rating} ({p.reviewCount})</Text>
                  <Text style={s.cardPrice}>From ${Math.min(...p.services.map(s => s.price))}</Text>
                </View>
              </View>
            </Pressable>
          ))
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { backgroundColor: '#fff', padding: 20, paddingBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  title: { fontSize: 26, fontWeight: '800', color: '#1A1A2E', marginBottom: 14 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#EBEBEB' },
  input: { flex: 1, fontSize: 15, color: '#1A1A2E' },
  filterBar: { backgroundColor: '#fff', paddingLeft: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F8F9FA', marginRight: 8, borderWidth: 1, borderColor: '#EBEBEB' },
  catChipActive: { backgroundColor: P, borderColor: P },
  catText: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },
  catTextActive: { color: '#fff', fontWeight: '600' },
  sortRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  sortBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EBEBEB' },
  sortBtnActive: { borderColor: P, backgroundColor: '#FFF0F7' },
  sortText: { fontSize: 12, color: '#8E8E93', fontWeight: '600' },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardEmoji: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF0F7', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#1A1A2E' },
  cardCat: { fontSize: 13, color: P, marginTop: 2 },
  cardCity: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  cardRating: { fontSize: 12, color: '#8E8E93' },
  cardPrice: { fontSize: 13, fontWeight: '600', color: '#1A1A2E' },
});
