import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable,
  StyleSheet, SafeAreaView, StatusBar, Image, Platform,
  ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QUASAR_CATEGORIES, QuasarCategory, QuasarService } from '../quasarData';
import { useCart } from '../CartContext';
import { COLORS, RADIUS } from '../theme';
import { SearchScreenProps } from '../navigation';

/* ─────────── helpers ─────────── */
interface SearchResult {
  service: QuasarService;
  cat: QuasarCategory;
}

function buildSearchResults(query: string, catId: string | null): SearchResult[] {
  const results: SearchResult[] = [];
  for (const cat of QUASAR_CATEGORIES) {
    if (catId && cat.id !== catId) continue;
    for (const svc of cat.services) {
      const q = query.toLowerCase().trim();
      if (!q || svc.name.toLowerCase().includes(q) || cat.name.toLowerCase().includes(q)) {
        results.push({ service: svc, cat });
      }
    }
  }
  return results;
}

/* ─────────── Main screen ─────────── */
export default function SearchScreen({ navigation }: SearchScreenProps) {
  const [query, setQuery] = useState('');
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const { addItem, removeItem, items, totalItems, totalPrice } = useCart();

  const getQty = (svcId: string) => items.find(i => i.service.id === svcId)?.qty ?? 0;

  const isSearching = query.trim().length > 0;
  const showTiles   = !isSearching && activeCatId === null;

  const activeCat = activeCatId ? QUASAR_CATEGORIES.find(c => c.id === activeCatId) ?? null : null;

  const filteredResults = isSearching || activeCatId
    ? buildSearchResults(query, isSearching ? null : activeCatId)
    : [];

  const handleClearSearch = useCallback(() => { setQuery(''); setActiveCatId(null); }, []);
  const handleCatTile     = useCallback((catId: string) => {
    setActiveCatId(catId);
    setQuery('');
  }, []);
  const handleCatChip     = useCallback((catId: string | null) => {
    setActiveCatId(catId);
    setQuery('');
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.logoRow}>
          <Image
            source={require('../../assets/quasar-logo-new.png')}
            style={s.topLogo}
            resizeMode="contain"
          />
          <View>
            <Text style={s.logoTagline}>Luxury Salon</Text>
            <Text style={s.logoSub}>Browse Services</Text>
          </View>
        </View>
      </View>

      {/* ── Search bar ── */}
      <View style={s.searchWrap}>
        <View style={s.searchBox}>
          <Ionicons name="search" size={16} color={COLORS.textMuted} style={s.searchIcon} />
          <TextInput
            style={s.searchInput}
            placeholder="Search services…"
            placeholderTextColor={COLORS.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={handleClearSearch} hitSlop={10}>
              <Ionicons name="close-circle" size={17} color={COLORS.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* ── Category tab chips (shown when drilled into a category or searching) ── */}
      {!showTiles && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.chipScroll}
          contentContainerStyle={s.chipContent}
        >
          <Pressable
            style={[s.chip, activeCatId === null && s.chipActive]}
            onPress={() => handleCatChip(null)}
          >
            <Text style={[s.chipText, activeCatId === null && s.chipTextActive]}>All</Text>
          </Pressable>

          {QUASAR_CATEGORIES.map(cat => (
            <Pressable
              key={cat.id}
              style={[s.chip, activeCatId === cat.id && !isSearching && s.chipActive]}
              onPress={() => handleCatChip(cat.id)}
            >
              <Text style={[s.chipText, activeCatId === cat.id && !isSearching && s.chipTextActive]}>
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {showTiles ? (
        /* ── TILE VIEW ── */
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.tilesContainer}
        >
          {QUASAR_CATEGORIES.map(cat => (
            <CategoryTile key={cat.id} cat={cat} onPress={() => handleCatTile(cat.id)} />
          ))}
        </ScrollView>
      ) : (
        /* ── SERVICE LIST VIEW ── */
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            s.listContainer,
            { paddingBottom: totalItems > 0 ? 110 : 40 },
          ]}
        >
          {!isSearching && activeCat ? (
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>{activeCat.name}</Text>
              <Text style={s.sectionCount}>{filteredResults.length} services</Text>
            </View>
          ) : isSearching ? (
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Search results</Text>
              <Text style={s.sectionCount}>{filteredResults.length} found</Text>
            </View>
          ) : null}

          {filteredResults.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="search-outline" size={42} color={COLORS.textMuted} />
              <Text style={s.emptyTitle}>No results found</Text>
              <Text style={s.emptyText}>Try a different search or category</Text>
            </View>
          ) : (
            filteredResults.map(({ service, cat }) => {
              const qty = getQty(service.id);
              return (
                <ServiceRow
                  key={service.id}
                  service={service}
                  cat={cat}
                  qty={qty}
                  onAdd={() => addItem(service, cat)}
                  onRemove={() => removeItem(service.id)}
                  onCatPress={() => handleCatChip(cat.id)}
                />
              );
            })
          )}
        </ScrollView>
      )}

      {/* ── Cart bar ── */}
      {totalItems > 0 && (
        <Pressable style={s.cartBar} onPress={() => navigation.navigate('Cart')}>
          <View style={s.cartBadge}>
            <Text style={s.cartBadgeText}>{totalItems}</Text>
          </View>
          <Text style={s.cartBarLabel}>{totalItems} service{totalItems > 1 ? 's' : ''} added</Text>
          <Text style={s.cartBarPrice}>₹{totalPrice.toLocaleString('en-IN')} →</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

/* ─────────── Category tile ─────────── */
function CategoryTile({ cat, onPress }: { cat: QuasarCategory; onPress: () => void }) {
  const src: ImageSourcePropType =
    typeof cat.imageUrl === 'string' ? { uri: cat.imageUrl } : (cat.imageUrl as ImageSourcePropType);
  return (
    <Pressable style={s.tile} onPress={onPress} android_ripple={{ color: 'rgba(255,255,255,0.15)' }}>
      <Image source={src} style={s.tileImage} resizeMode="cover" />
      <View style={s.tileOverlay} />
      <View style={s.tileLabelRow}>
        <Text style={s.tileName}>{cat.name}</Text>
        <View style={s.tileArrow}>
          <Ionicons name="chevron-forward" size={16} color="#fff" />
        </View>
      </View>
      <Text style={s.tileCount}>{cat.services.length} services</Text>
    </Pressable>
  );
}

/* ─────────── Service row ─────────── */
function ServiceRow({
  service,
  cat,
  qty,
  onAdd,
  onRemove,
  onCatPress,
}: {
  service: QuasarService;
  cat: QuasarCategory;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
  onCatPress: () => void;
}) {
  return (
    <View style={s.serviceRow}>
      <View style={s.serviceInfo}>
        <Text style={s.serviceName} numberOfLines={2}>{service.name}</Text>
        <View style={s.serviceMeta}>
          <View style={s.durationPill}>
            <Ionicons name="time-outline" size={11} color={COLORS.textMuted} />
            <Text style={s.durationText}>{service.durationMins} min</Text>
          </View>
          {service.note ? (
            <Text style={s.noteText} numberOfLines={1}>{service.note}</Text>
          ) : null}
        </View>
        <Pressable onPress={onCatPress} hitSlop={6}>
          <Text style={s.catLabel}>{cat.name}</Text>
        </Pressable>
      </View>

      <View style={s.serviceRight}>
        <Text style={s.priceText}>₹{service.price.toLocaleString('en-IN')}</Text>

        {qty === 0 ? (
          <Pressable style={s.bookBtn} onPress={onAdd}>
            <Text style={s.bookBtnText}>Book</Text>
          </Pressable>
        ) : (
          <View style={s.qtyRow}>
            <Pressable style={s.qtyBtn} onPress={onRemove}>
              <Text style={s.qtyBtnText}>−</Text>
            </Pressable>
            <Text style={s.qtyNum}>{qty}</Text>
            <Pressable style={s.qtyBtn} onPress={onAdd}>
              <Text style={s.qtyBtnText}>+</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

/* ─────────── Styles ─────────── */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: COLORS.bg,
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

  searchWrap: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 7,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  searchIcon: { opacity: 0.7 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text, paddingVertical: 0 },

  chipScroll: {
    flexGrow: 0,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chipContent: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgElevated,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.bg },

  tilesContainer: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 110, gap: 12 },

  tile: {
    height: 160,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.bgCard,
    position: 'relative',
  },
  tileImage: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
  },
  tileOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  tileLabelRow: {
    position: 'absolute',
    bottom: 28,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    flex: 1,
  },
  tileArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileCount: {
    position: 'absolute',
    bottom: 10,
    left: 16,
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },

  listContainer: { paddingHorizontal: 16, paddingTop: 4 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  sectionCount: { fontSize: 12, color: COLORS.textMuted },

  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 14, fontWeight: '700', color: COLORS.text, lineHeight: 20 },
  serviceMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.bgElevated,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
  },
  durationText: { fontSize: 11, color: COLORS.textMuted, fontWeight: '500' },
  noteText: { fontSize: 11, color: COLORS.textMuted, fontStyle: 'italic', flex: 1 },
  catLabel: { fontSize: 11, color: COLORS.primary, fontWeight: '600', marginTop: 5 },

  serviceRight: { alignItems: 'flex-end', gap: 8, minWidth: 80 },
  priceText: { fontSize: 15, fontWeight: '800', color: COLORS.primary },

  bookBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  bookBtnText: { color: COLORS.primary, fontWeight: '800', fontSize: 13 },

  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: {
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { color: COLORS.bg, fontSize: 18, fontWeight: '800', lineHeight: 22 },
  qtyNum: { fontSize: 14, fontWeight: '800', color: COLORS.text, minWidth: 20, textAlign: 'center' },

  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  emptyText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },

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
