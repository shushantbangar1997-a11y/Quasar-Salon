import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  SafeAreaView, StatusBar,
} from 'react-native';
import { QuasarService } from '../quasarData';
import { useCart } from '../CartContext';
import { COLORS, RADIUS } from '../theme';
import { CategoryScreenProps } from '../navigation';

export default function CategoryScreen({ route, navigation }: CategoryScreenProps) {
  const { category } = route.params;
  const { addItem, removeItem, items, totalItems, totalPrice } = useCart();
  const [filter, setFilter] = useState<'All' | 'Women' | 'Men' | 'Both'>('All');

  const filtered = category.services.filter(s =>
    filter === 'All' || s.gender === filter || s.gender === 'Both'
  );

  const getQty = (svc: QuasarService) => {
    const item = items.find(i => i.service.id === svc.id);
    return item?.qty || 0;
  };

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.back}>
          <Text style={s.backText}>←</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.catIcon}>{category.icon}</Text>
          <Text style={s.title}>{category.name}</Text>
          <Text style={s.subtitle}>{category.services.length} services available</Text>
        </View>
      </View>

      {/* Gender filter */}
      <View style={s.filterRow}>
        {(['All', 'Women', 'Men'] as const).map(f => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[s.filterChip, filter === f && s.filterChipActive]}
          >
            <Text style={[s.filterText, filter === f && s.filterTextActive]}>{f}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: totalItems > 0 ? 100 : 30 }}
      >
        {filtered.map(svc => {
          const qty = getQty(svc);
          return (
            <View key={svc.id} style={s.card}>
              <View style={s.cardInfo}>
                <Text style={s.svcName}>{svc.name}</Text>
                {svc.note && <Text style={s.svcNote}>{svc.note}</Text>}
                <View style={s.metaRow}>
                  <Text style={s.metaDuration}>⏱ {formatDuration(svc.durationMins)}</Text>
                  <View style={[s.genderTag, svc.gender === 'Men' ? s.genderTagMen : svc.gender === 'Both' ? s.genderTagBoth : s.genderTagWomen]}>
                    <Text style={s.genderText}>
                      {svc.gender === 'Both' ? '♂♀' : svc.gender === 'Men' ? '♂ Men' : '♀ Women'}
                    </Text>
                  </View>
                </View>
                <Text style={s.price}>₹{svc.price.toLocaleString('en-IN')}</Text>
              </View>
              <View style={s.addWrap}>
                {qty === 0 ? (
                  <Pressable style={s.addBtn} onPress={() => addItem(svc, category)}>
                    <Text style={s.addBtnText}>ADD</Text>
                  </Pressable>
                ) : (
                  <View style={s.qtyRow}>
                    <Pressable style={s.qtyBtn} onPress={() => removeItem(svc.id)}>
                      <Text style={s.qtyBtnText}>−</Text>
                    </Pressable>
                    <Text style={s.qtyNum}>{qty}</Text>
                    <Pressable style={s.qtyBtn} onPress={() => addItem(svc, category)}>
                      <Text style={s.qtyBtnText}>+</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Floating cart bar */}
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

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'flex-start', padding: 20, backgroundColor: COLORS.bgCard, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  back: { marginRight: 14, marginTop: 4 },
  backText: { fontSize: 22, color: COLORS.primary, fontWeight: '700' },
  catIcon: { fontSize: 28, marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.bgCard, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bgElevated },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  filterTextActive: { color: COLORS.bg },
  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center' },
  cardInfo: { flex: 1, marginRight: 12 },
  svcName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  svcNote: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  metaDuration: { fontSize: 12, color: COLORS.textSecondary },
  genderTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  genderTagWomen: { backgroundColor: '#3A1A2A' },
  genderTagMen: { backgroundColor: '#1A2A3A' },
  genderTagBoth: { backgroundColor: '#1A2A1A' },
  genderText: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '600' },
  price: { fontSize: 17, fontWeight: '800', color: COLORS.primary, marginTop: 8 },
  addWrap: { alignItems: 'center' },
  addBtn: { borderWidth: 1.5, borderColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.sm },
  addBtnText: { color: COLORS.primary, fontWeight: '800', fontSize: 13 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  qtyBtn: { backgroundColor: COLORS.primary, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: COLORS.bg, fontSize: 18, fontWeight: '800', lineHeight: 22 },
  qtyNum: { fontSize: 16, fontWeight: '800', color: COLORS.text, minWidth: 24, textAlign: 'center' },
  cartBar: { position: 'absolute', bottom: 12, left: 16, right: 16, backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, shadowColor: COLORS.primary, shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  cartBadge: { backgroundColor: COLORS.bg, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cartBadgeText: { fontSize: 12, fontWeight: '800', color: COLORS.primary },
  cartBarLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.bg },
  cartBarPrice: { fontSize: 14, fontWeight: '800', color: COLORS.bg },
});
