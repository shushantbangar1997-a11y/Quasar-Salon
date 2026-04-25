import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable,
  StyleSheet, SafeAreaView, StatusBar, Image,
} from 'react-native';
import { QUASAR_CATEGORIES, QuasarService } from '../quasarData';
import { useCart } from '../CartContext';
import { COLORS, RADIUS } from '../theme';
import { SearchScreenProps } from '../navigation';

interface SearchResult {
  service: QuasarService;
  catId: string;
  catName: string;
  catIcon: string;
}

export default function SearchScreen({ navigation }: SearchScreenProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const { addItem, removeItem, items, totalItems, totalPrice } = useCart();

  const getQty = (svcId: string) => items.find(i => i.service.id === svcId)?.qty || 0;

  const allCategories = ['All', ...QUASAR_CATEGORIES.map(c => c.name)];

  const results: SearchResult[] = [];
  for (const cat of QUASAR_CATEGORIES) {
    const matchCat = activeCategory === 'All' || cat.name === activeCategory;
    if (!matchCat) continue;
    for (const svc of cat.services) {
      const q = query.toLowerCase();
      if (!q || svc.name.toLowerCase().includes(q) || cat.name.toLowerCase().includes(q)) {
        results.push({ service: svc, catId: cat.id, catName: cat.name, catIcon: cat.icon });
      }
    }
  }

  const catForId = (catId: string) => QUASAR_CATEGORIES.find(c => c.id === catId)!;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* Brand header — mirrors HomeScreen header */}
      <View style={s.header}>
        <View style={s.logoRow}>
          <Image
            source={require('../../assets/quasar-logo-new.png')}
            style={s.topLogo}
            resizeMode="contain"
          />
          <View>
            <Text style={s.logoTagline}>Luxury Salon</Text>
            <Text style={s.logoSub}>Explore services</Text>
          </View>
        </View>

        {/* Search input — right side of header */}
        <View style={s.searchBox}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.input}
            placeholder="Hair, nails, massage…"
            placeholderTextColor={COLORS.textMuted}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Text style={s.clearBtn}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Category filter strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.catScroll}
        contentContainerStyle={s.catContent}
      >
        {allCategories.map(cat => (
          <Pressable
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[s.catChip, activeCategory === cat && s.catChipActive]}
          >
            <Text style={[s.catText, activeCategory === cat && s.catTextActive]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Result count */}
      <View style={s.countRow}>
        <Text style={s.countText}>{results.length} result{results.length !== 1 ? 's' : ''}</Text>
        {activeCategory !== 'All' && (
          <Pressable onPress={() => setActiveCategory('All')}>
            <Text style={s.clearFilter}>Clear ✕</Text>
          </Pressable>
        )}
      </View>

      {/* Service list */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: totalItems > 0 ? 100 : 30 }}
      >
        {results.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 40 }}>🔍</Text>
            <Text style={s.emptyTitle}>No results found</Text>
            <Text style={s.emptyText}>Try a different search or category</Text>
          </View>
        ) : (
          results.map(r => {
            const qty = getQty(r.service.id);
            const cat = catForId(r.catId);
            return (
              <View key={r.service.id} style={s.card}>
                <View style={s.catIconWrap}>
                  <Text style={{ fontSize: 22 }}>{r.catIcon}</Text>
                </View>
                <View style={s.cardMid}>
                  <Text style={s.svcName} numberOfLines={2}>{r.service.name}</Text>
                  <Pressable onPress={() => navigation.navigate('Category', { category: cat })}>
                    <Text style={s.catLabel}>{r.catName} →</Text>
                  </Pressable>
                  <Text style={s.price}>₹{r.service.price.toLocaleString('en-IN')}</Text>
                </View>
                <View style={s.addWrap}>
                  {qty === 0 ? (
                    <Pressable style={s.addBtn} onPress={() => addItem(r.service, cat)}>
                      <Text style={s.addBtnText}>ADD</Text>
                    </Pressable>
                  ) : (
                    <View style={s.qtyRow}>
                      <Pressable style={s.qtyBtn} onPress={() => removeItem(r.service.id)}>
                        <Text style={s.qtyBtnText}>−</Text>
                      </Pressable>
                      <Text style={s.qtyNum}>{qty}</Text>
                      <Pressable style={s.qtyBtn} onPress={() => addItem(r.service, cat)}>
                        <Text style={s.qtyBtnText}>+</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {totalItems > 0 && (
        <Pressable style={s.cartBar} onPress={() => navigation.navigate('Cart')}>
          <View style={s.cartBadge}><Text style={s.cartBadgeText}>{totalItems}</Text></View>
          <Text style={s.cartBarLabel}>{totalItems} service{totalItems > 1 ? 's' : ''} added</Text>
          <Text style={s.cartBarPrice}>₹{totalPrice.toLocaleString('en-IN')} →</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topLogo: { width: 42, height: 42 },
  logoTagline: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  logoSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 1,
  },

  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginLeft: 14,
    maxWidth: 200,
  },
  searchIcon: { fontSize: 13, marginRight: 6 },
  input: { flex: 1, fontSize: 13, color: COLORS.text, paddingVertical: 0 },
  clearBtn: { color: COLORS.textMuted, fontSize: 13 },

  catScroll: {
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  catContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    alignItems: 'center',
  },
  catChip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgElevated,
  },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  catTextActive: { color: COLORS.bg },

  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  countText: { fontSize: 12, color: COLORS.textMuted },
  clearFilter: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 12 },
  emptyText: { color: COLORS.textSecondary, marginTop: 6 },

  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  catIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardMid: { flex: 1, marginRight: 8 },
  svcName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  catLabel: { fontSize: 12, color: COLORS.primary, marginTop: 3 },
  price: { fontSize: 15, fontWeight: '800', color: COLORS.primary, marginTop: 6 },
  addWrap: {},
  addBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
  },
  addBtnText: { color: COLORS.primary, fontWeight: '800', fontSize: 12 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  qtyBtn: {
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { color: COLORS.bg, fontSize: 16, fontWeight: '800', lineHeight: 20 },
  qtyNum: { fontSize: 14, fontWeight: '800', color: COLORS.text, minWidth: 20, textAlign: 'center' },

  cartBar: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  cartBadge: {
    backgroundColor: COLORS.bg,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cartBadgeText: { fontSize: 12, fontWeight: '800', color: COLORS.primary },
  cartBarLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.bg },
  cartBarPrice: { fontSize: 14, fontWeight: '800', color: COLORS.bg },
});
