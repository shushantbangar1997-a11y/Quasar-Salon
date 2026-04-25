import React from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  SafeAreaView, StatusBar,
} from 'react-native';
import { useCart } from '../CartContext';
import { COLORS, RADIUS } from '../theme';
import { CartScreenProps } from '../navigation';

export default function CartScreen({ navigation }: CartScreenProps) {
  const { items, addItem, removeItem, clearCart, totalItems, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <View style={s.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={s.back}>←</Text>
          </Pressable>
          <Text style={s.title}>Your Cart</Text>
        </View>
        <View style={s.empty}>
          <Text style={{ fontSize: 60 }}>🛒</Text>
          <Text style={s.emptyTitle}>Your cart is empty</Text>
          <Text style={s.emptyText}>Browse our services and add them here</Text>
          <Pressable style={s.browseBtn} onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}>
            <Text style={s.browseBtnText}>Browse Services</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={s.back}>←</Text>
        </Pressable>
        <Text style={s.title}>Your Cart</Text>
        <Pressable onPress={clearCart}>
          <Text style={s.clearText}>Clear</Text>
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <Text style={s.sectionLabel}>{totalItems} Service{totalItems > 1 ? 's' : ''} Selected</Text>

        {items.map(item => (
          <View key={item.service.id} style={s.card}>
            <View style={s.cardLeft}>
              <Text style={s.catIcon}>{item.category.icon}</Text>
            </View>
            <View style={s.cardMid}>
              <Text style={s.svcName} numberOfLines={2}>{item.service.name}</Text>
              <Text style={s.catName}>{item.category.name}</Text>
              <Text style={s.price}>₹{(item.service.price * item.qty).toLocaleString('en-IN')}</Text>
            </View>
            <View style={s.qtyRow}>
              <Pressable style={s.qtyBtn} onPress={() => removeItem(item.service.id)}>
                <Text style={s.qtyBtnText}>−</Text>
              </Pressable>
              <Text style={s.qtyNum}>{item.qty}</Text>
              <Pressable style={s.qtyBtn} onPress={() => addItem(item.service, item.category)}>
                <Text style={s.qtyBtnText}>+</Text>
              </Pressable>
            </View>
          </View>
        ))}

        {/* Price breakdown */}
        <View style={s.priceBox}>
          <Text style={s.priceBoxTitle}>Price Details</Text>
          {items.map(item => (
            <View key={item.service.id} style={s.priceRow}>
              <Text style={s.priceRowLabel} numberOfLines={1}>{item.service.name} × {item.qty}</Text>
              <Text style={s.priceRowVal}>₹{(item.service.price * item.qty).toLocaleString('en-IN')}</Text>
            </View>
          ))}
          <View style={s.divider} />
          <View style={s.priceRow}>
            <Text style={[s.priceRowLabel, { fontWeight: '800', color: COLORS.text }]}>Total</Text>
            <Text style={[s.priceRowVal, { fontWeight: '800', color: COLORS.primary, fontSize: 17 }]}>
              ₹{totalPrice.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Proceed to book */}
      <View style={s.footer}>
        <View style={s.footerInfo}>
          <Text style={s.footerTotal}>₹{totalPrice.toLocaleString('en-IN')}</Text>
          <Text style={s.footerSub}>{totalItems} service{totalItems > 1 ? 's' : ''}</Text>
        </View>
        <Pressable style={s.bookBtn} onPress={() => navigation.navigate('Booking')}>
          <Text style={s.bookBtnText}>Proceed to Book →</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: COLORS.bgCard, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  back: { fontSize: 22, color: COLORS.primary, fontWeight: '700', marginRight: 16 },
  title: { flex: 1, fontSize: 20, fontWeight: '800', color: COLORS.text },
  clearText: { fontSize: 14, color: COLORS.error, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginTop: 16 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8, textAlign: 'center' },
  browseBtn: { marginTop: 28, backgroundColor: COLORS.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: RADIUS.lg },
  browseBtnText: { color: COLORS.bg, fontWeight: '700', fontSize: 15 },
  sectionLabel: { fontSize: 13, color: COLORS.textMuted, marginBottom: 12, letterSpacing: 0.5, textTransform: 'uppercase' },
  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center' },
  cardLeft: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryDim, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  catIcon: { fontSize: 22 },
  cardMid: { flex: 1, marginRight: 8 },
  svcName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  catName: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  price: { fontSize: 15, fontWeight: '700', color: COLORS.primary, marginTop: 6 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  qtyBtn: { backgroundColor: COLORS.primary, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: COLORS.bg, fontSize: 16, fontWeight: '800', lineHeight: 20 },
  qtyNum: { fontSize: 15, fontWeight: '800', color: COLORS.text, minWidth: 22, textAlign: 'center' },
  priceBox: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 16, marginTop: 8, borderWidth: 1, borderColor: COLORS.border },
  priceBoxTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  priceRowLabel: { fontSize: 14, color: COLORS.textSecondary, flex: 1, marginRight: 12 },
  priceRowVal: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  footer: { backgroundColor: COLORS.bgCard, borderTopWidth: 1, borderTopColor: COLORS.border, padding: 16, flexDirection: 'row', alignItems: 'center' },
  footerInfo: { flex: 1 },
  footerTotal: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  footerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  bookBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: RADIUS.lg },
  bookBtnText: { color: COLORS.bg, fontWeight: '800', fontSize: 15 },
});
