import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  SafeAreaView, StatusBar, Modal, TextInput, KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart, Guest, CartItem, SELF_GUEST_ID } from '../CartContext';
import { COLORS, RADIUS } from '../theme';
import { CartScreenProps } from '../navigation';

export default function CartScreen({ navigation }: CartScreenProps) {
  const {
    guests, addGuest, removeGuest,
    addItemForGuest, removeItemForGuest,
    clearCart, totalItems, totalPrice,
  } = useCart();

  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendName, setFriendName] = useState('');

  const hasAnyItem = totalItems > 0;

  const handleAddFriend = () => {
    const name = friendName.trim();
    if (!name) return;
    addGuest(name);
    setFriendName('');
    setShowAddFriend(false);
  };

  if (!hasAnyItem) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
        <View style={s.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
          </Pressable>
          <Text style={s.title}>Your Cart</Text>
        </View>
        <View style={s.empty}>
          <Ionicons name="cart-outline" size={64} color={COLORS.textMuted} />
          <Text style={s.emptyTitle}>Your cart is empty</Text>
          <Text style={s.emptyText}>Browse our services and add them here</Text>
          <Pressable
            style={s.browseBtn}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          >
            <Text style={s.browseBtnText}>Browse Services</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const grandTotal = guests.reduce(
    (sum, g) => sum + g.items.reduce((s, i) => s + i.service.price * i.qty, 0),
    0
  );

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
        </Pressable>
        <Text style={s.title}>Your Cart</Text>
        <Pressable onPress={clearCart} hitSlop={10}>
          <Text style={s.clearText}>Clear all</Text>
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 140 }}
      >
        {guests.map((guest, idx) => (
          <GuestSection
            key={guest.id}
            guest={guest}
            isFirst={idx === 0}
            onRemoveGuest={() => removeGuest(guest.id)}
            onAddItem={(svc, cat) => addItemForGuest(svc, cat, guest.id)}
            onRemoveItem={svcId => removeItemForGuest(svcId, guest.id)}
          />
        ))}

        {/* Add a Friend button */}
        <Pressable style={s.addFriendBtn} onPress={() => setShowAddFriend(true)}>
          <Ionicons name="person-add-outline" size={18} color={COLORS.primary} />
          <Text style={s.addFriendText}>Add a Friend</Text>
        </Pressable>

        {/* Price details */}
        <View style={s.priceBox}>
          <Text style={s.priceBoxTitle}>Price Details</Text>

          {guests.map(guest => {
            const guestTotal = guest.items.reduce(
              (sum, i) => sum + i.service.price * i.qty,
              0
            );
            if (guest.items.length === 0) return null;
            return (
              <View key={guest.id} style={s.guestPriceBlock}>
                <Text style={s.guestPriceLabel}>{guest.name}</Text>
                {guest.items.map(item => (
                  <View key={item.service.id} style={s.priceRow}>
                    <Text style={s.priceRowLabel} numberOfLines={1}>
                      {item.service.name} × {item.qty}
                    </Text>
                    <Text style={s.priceRowVal}>
                      ₹{(item.service.price * item.qty).toLocaleString('en-IN')}
                    </Text>
                  </View>
                ))}
                <View style={[s.priceRow, s.subtotalRow]}>
                  <Text style={s.subtotalLabel}>{guest.name}'s subtotal</Text>
                  <Text style={s.subtotalVal}>₹{guestTotal.toLocaleString('en-IN')}</Text>
                </View>
              </View>
            );
          })}

          <View style={s.divider} />
          <View style={s.priceRow}>
            <Text style={[s.priceRowLabel, { fontWeight: '800', color: COLORS.text }]}>
              Grand Total
            </Text>
            <Text style={[s.priceRowVal, { fontWeight: '800', color: COLORS.primary, fontSize: 17 }]}>
              ₹{grandTotal.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={s.footer}>
        <View style={s.footerInfo}>
          <Text style={s.footerTotal}>₹{grandTotal.toLocaleString('en-IN')}</Text>
          <Text style={s.footerSub}>
            {totalItems} service{totalItems > 1 ? 's' : ''} · {guests.length} guest{guests.length > 1 ? 's' : ''}
          </Text>
        </View>
        <Pressable style={s.bookBtn} onPress={() => navigation.navigate('Booking')}>
          <Text style={s.bookBtnText}>Book →</Text>
        </Pressable>
      </View>

      {/* Add Friend Modal */}
      <Modal
        visible={showAddFriend}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddFriend(false)}
      >
        <KeyboardAvoidingView
          style={s.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={s.modalBackdrop} onPress={() => setShowAddFriend(false)} />
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Add a Friend</Text>
            <Text style={s.modalSub}>Enter your friend's name to add their services separately.</Text>
            <View style={s.nameInputWrap}>
              <Ionicons name="person-outline" size={16} color={COLORS.textMuted} />
              <TextInput
                style={s.nameInput}
                placeholder="e.g. Priya, Mom, Kavya…"
                placeholderTextColor={COLORS.textMuted}
                value={friendName}
                onChangeText={setFriendName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleAddFriend}
                maxLength={30}
              />
            </View>
            <View style={s.modalActions}>
              <Pressable style={s.modalCancel} onPress={() => { setShowAddFriend(false); setFriendName(''); }}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[s.modalConfirm, !friendName.trim() && s.modalConfirmDisabled]}
                onPress={handleAddFriend}
                disabled={!friendName.trim()}
              >
                <Text style={s.modalConfirmText}>Add Friend</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

/* ── Per-guest section ── */
function GuestSection({
  guest,
  isFirst,
  onRemoveGuest,
  onAddItem,
  onRemoveItem,
}: {
  guest: Guest;
  isFirst: boolean;
  onRemoveGuest: () => void;
  onAddItem: (svc: CartItem['service'], cat: CartItem['category']) => void;
  onRemoveItem: (svcId: string) => void;
}) {
  return (
    <View style={s.guestSection}>
      {/* Guest header */}
      <View style={s.guestHeader}>
        <View style={s.guestAvatarWrap}>
          <Ionicons
            name={isFirst ? 'person' : 'person-outline'}
            size={14}
            color={isFirst ? COLORS.bg : COLORS.primary}
          />
        </View>
        <Text style={s.guestName}>{guest.name}</Text>
        {!isFirst && (
          <Pressable onPress={onRemoveGuest} hitSlop={12} style={s.removeGuestBtn}>
            <Ionicons name="close" size={16} color={COLORS.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Guest service items */}
      {guest.items.length === 0 ? (
        <View style={s.guestEmpty}>
          <Text style={s.guestEmptyText}>No services added yet</Text>
        </View>
      ) : (
        guest.items.map(item => (
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
              <Pressable style={s.qtyBtn} onPress={() => onRemoveItem(item.service.id)}>
                <Text style={s.qtyBtnText}>−</Text>
              </Pressable>
              <Text style={s.qtyNum}>{item.qty}</Text>
              <Pressable style={s.qtyBtn} onPress={() => onAddItem(item.service, item.category)}>
                <Text style={s.qtyBtnText}>+</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  title: { flex: 1, fontSize: 20, fontWeight: '800', color: COLORS.text },
  clearText: { fontSize: 14, color: COLORS.error, fontWeight: '600' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
  browseBtn: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
  },
  browseBtnText: { color: COLORS.bg, fontWeight: '700', fontSize: 15 },

  /* Guest section */
  guestSection: {
    marginBottom: 16,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  guestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  guestAvatarWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestName: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.text },
  removeGuestBtn: { padding: 4 },
  guestEmpty: { padding: 16, alignItems: 'center' },
  guestEmptyText: { fontSize: 13, color: COLORS.textMuted, fontStyle: 'italic' },

  card: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cardLeft: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  catIcon: { fontSize: 20 },
  cardMid: { flex: 1, marginRight: 8 },
  svcName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  catName: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  price: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginTop: 4 },
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
  qtyNum: { fontSize: 15, fontWeight: '800', color: COLORS.text, minWidth: 22, textAlign: 'center' },

  /* Add friend */
  addFriendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: 14,
    justifyContent: 'center',
    marginBottom: 16,
  },
  addFriendText: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },

  /* Price box */
  priceBox: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priceBoxTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  guestPriceBlock: { marginBottom: 12 },
  guestPriceLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  priceRowLabel: { fontSize: 13, color: COLORS.textSecondary, flex: 1, marginRight: 12 },
  priceRowVal: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  subtotalRow: { paddingTop: 4, marginTop: 2 },
  subtotalLabel: { fontSize: 12, color: COLORS.textMuted, fontStyle: 'italic' },
  subtotalVal: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },

  /* Footer */
  footer: {
    backgroundColor: COLORS.bgCard,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerInfo: { flex: 1 },
  footerTotal: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  footerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  bookBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
  },
  bookBtnText: { color: COLORS.bg, fontWeight: '800', fontSize: 15 },

  /* Add friend modal */
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  modalSub: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 20 },
  nameInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    gap: 10,
    marginBottom: 20,
  },
  nameInput: { flex: 1, fontSize: 15, color: COLORS.text, paddingVertical: 0 },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 14,
    alignItems: 'center',
  },
  modalCancelText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  modalConfirm: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: 14,
    alignItems: 'center',
  },
  modalConfirmDisabled: { backgroundColor: COLORS.bgElevated },
  modalConfirmText: { fontSize: 14, fontWeight: '800', color: COLORS.bg },
});
