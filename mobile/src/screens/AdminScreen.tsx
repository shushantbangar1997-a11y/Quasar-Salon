import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  SafeAreaView, StatusBar, TextInput, ActivityIndicator, Switch,
} from 'react-native';
import { useAdmin } from '../AdminContext';
import { useBookings, ConfirmedBooking } from '../BookingsContext';
import { QUASAR_STAFF, StaffMember } from '../quasarData';
import { COLORS, RADIUS, SHADOW } from '../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Admin'>;

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  confirmed: { bg: COLORS.successBg, color: COLORS.success, label: '✓ Confirmed' },
  pending:   { bg: '#FFF8E1',        color: '#B8860B',       label: '⏳ Pending' },
  completed: { bg: COLORS.bgElevated, color: COLORS.textSecondary, label: '✅ Done' },
  cancelled: { bg: COLORS.errorBg,   color: COLORS.error,    label: '✗ Cancelled' },
};

const EMOJI_OPTIONS = ['💇', '💆', '✂️', '💄', '💅', '🧖', '🧴', '👨‍🎨', '👩‍🎨', '🌟', '💎', '🪄'];

const SPECIALTY_OPTIONS = [
  'Hair Care', 'Transformation', 'Make-Up', 'Skin Care',
  'Nail Art', 'Threading', 'Waxing', 'Bridal', 'Spa & Massage',
];

function StatCard({ value, label, color }: { value: string | number; label: string; color?: string }) {
  return (
    <View style={s.statCard}>
      <Text style={[s.statValue, color ? { color } : {}]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function LoginPanel({ onLogin }: { onLogin: (pw: string) => boolean }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!pw.trim()) { setError('Enter the admin password.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const ok = onLogin(pw.trim());
    setLoading(false);
    if (!ok) {
      setError('Incorrect password. Try again.');
      setPw('');
    }
  };

  return (
    <View style={s.loginWrap}>
      <View style={s.loginCard}>
        <Text style={s.loginIcon}>🔐</Text>
        <Text style={s.loginTitle}>Admin Portal</Text>
        <Text style={s.loginSub}>Enter the admin password to continue</Text>

        {error ? <Text style={s.loginError}>{error}</Text> : null}

        <TextInput
          style={s.input}
          placeholder="Admin password"
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry
          value={pw}
          onChangeText={t => { setPw(t); setError(''); }}
          onSubmitEditing={handleSubmit}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Pressable
          style={[s.loginBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={COLORS.bg} size="small" />
            : <Text style={s.loginBtnText}>Enter Dashboard</Text>
          }
        </Pressable>
      </View>
    </View>
  );
}

const BLANK_FORM = {
  name: '',
  role: '',
  experience: '',
  specialties: [] as string[],
  emoji: '✂️',
  available: true,
};

export default function AdminScreen({ navigation }: Props) {
  const { isAdmin, loginAsAdmin, logoutAdmin } = useAdmin();
  const { bookings, cancelBooking } = useBookings();

  const [tab, setTab] = useState<'bookings' | 'staff'>('bookings');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [staffList, setStaffList] = useState<StaffMember[]>([...QUASAR_STAFF]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [formError, setFormError] = useState('');

  if (!isAdmin) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
        <View style={s.topBar}>
          <Pressable style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backText}>← Back</Text>
          </Pressable>
        </View>
        <LoginPanel onLogin={loginAsAdmin} />
      </SafeAreaView>
    );
  }

  const allBookings = [...bookings].sort((a, b) => b.createdAt - a.createdAt);
  const filtered = statusFilter === 'all' ? allBookings : allBookings.filter(b => b.status === statusFilter);
  const totalRevenue = allBookings.reduce((sum, b) => sum + (b.status !== 'cancelled' ? b.total : 0), 0);
  const pending   = allBookings.filter(b => b.status === 'pending').length;
  const confirmed = allBookings.filter(b => b.status === 'confirmed').length;

  const handleStatusChange = async (booking: ConfirmedBooking, newStatus: ConfirmedBooking['status']) => {
    setUpdatingId(booking.id);
    try {
      if (newStatus === 'cancelled') await cancelBooking(booking.id);
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleAvailability = (id: string) => {
    setStaffList(prev => prev.map(st => st.id === id ? { ...st, available: !st.available } : st));
  };

  const removeStaff = (id: string) => {
    setStaffList(prev => prev.filter(st => st.id !== id));
  };

  const toggleSpecialty = (sp: string) => {
    setForm(f => ({
      ...f,
      specialties: f.specialties.includes(sp)
        ? f.specialties.filter(s => s !== sp)
        : [...f.specialties, sp],
    }));
  };

  const handleAddEmployee = () => {
    if (!form.name.trim()) { setFormError('Name is required.'); return; }
    if (!form.role.trim()) { setFormError('Role is required.'); return; }
    if (form.specialties.length === 0) { setFormError('Select at least one specialty.'); return; }

    const newMember: StaffMember = {
      id: `staff-custom-${Date.now()}`,
      name: form.name.trim(),
      role: form.role.trim(),
      experience: form.experience.trim() || 'New hire',
      specialties: form.specialties,
      emoji: form.emoji,
      available: form.available,
      schedule: {},
    };

    setStaffList(prev => [...prev, newMember]);
    setForm({ ...BLANK_FORM });
    setFormError('');
    setShowAddForm(false);
  };

  const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Pressable style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backText}>← Back</Text>
          </Pressable>
          <View>
            <Text style={s.headerTitle}>Admin Dashboard</Text>
            <Text style={s.headerSub}>Quasar Salon</Text>
          </View>
        </View>
        <Pressable style={s.logoutBtn} onPress={() => { logoutAdmin(); navigation.goBack(); }}>
          <Text style={s.logoutText}>Logout</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Stats row */}
        <View style={s.statsRow}>
          <StatCard value={allBookings.length} label="Total" />
          <StatCard value={pending}   label="Pending"   color="#B8860B" />
          <StatCard value={confirmed} label="Confirmed" color={COLORS.success} />
          <StatCard value={`₹${(totalRevenue / 1000).toFixed(1)}K`} label="Revenue" color={COLORS.primary} />
        </View>

        {/* Tabs */}
        <View style={s.tabs}>
          {(['bookings', 'staff'] as const).map(t => (
            <Pressable
              key={t}
              style={[s.tab, tab === t && s.tabActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[s.tabText, tab === t && s.tabTextActive]}>
                {t === 'bookings' ? `📅 Bookings (${allBookings.length})` : `👤 Staff (${staffList.length})`}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── BOOKINGS TAB ── */}
        {tab === 'bookings' && (
          <View style={s.section}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
              <View style={s.filterRow}>
                {FILTERS.map(f => (
                  <Pressable
                    key={f}
                    style={[s.filterPill, statusFilter === f && s.filterPillActive]}
                    onPress={() => setStatusFilter(f)}
                  >
                    <Text style={[s.filterPillText, statusFilter === f && s.filterPillTextActive]}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {filtered.length === 0 ? (
              <View style={s.empty}>
                <Text style={s.emptyIcon}>📋</Text>
                <Text style={s.emptyText}>No bookings found</Text>
              </View>
            ) : (
              filtered.map(booking => {
                const cfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
                const services = booking.services.map(s => `${s.service.name} ×${s.qty}`).join(', ');
                const isUpdating = updatingId === booking.id;

                return (
                  <View key={booking.id} style={s.bookingCard}>
                    <View style={s.bookingTop}>
                      <View style={s.bookingInfo}>
                        <Text style={s.bookingId} numberOfLines={1}>#{booking.id.slice(-8)}</Text>
                        <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
                          <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                        </View>
                      </View>
                      <Text style={s.bookingTotal}>₹{booking.total.toLocaleString('en-IN')}</Text>
                    </View>
                    <Text style={s.bookingServices} numberOfLines={2}>{services}</Text>
                    <View style={s.bookingMeta}>
                      <Text style={s.metaItem}>📅 {booking.date}</Text>
                      <Text style={s.metaItem}>🕐 {booking.time}</Text>
                      {booking.stylist && <Text style={s.metaItem}>✂️ {booking.stylist.name}</Text>}
                    </View>
                    {isUpdating ? (
                      <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 10 }} />
                    ) : (
                      <View style={s.actions}>
                        {booking.status === 'pending' && (
                          <>
                            <Pressable style={[s.actionBtn, { backgroundColor: COLORS.successBg, borderColor: COLORS.success }]} onPress={() => handleStatusChange(booking, 'confirmed')}>
                              <Text style={[s.actionText, { color: COLORS.success }]}>Approve</Text>
                            </Pressable>
                            <Pressable style={[s.actionBtn, { backgroundColor: COLORS.errorBg, borderColor: COLORS.error }]} onPress={() => handleStatusChange(booking, 'cancelled')}>
                              <Text style={[s.actionText, { color: COLORS.error }]}>Cancel</Text>
                            </Pressable>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <Pressable style={[s.actionBtn, { backgroundColor: COLORS.errorBg, borderColor: COLORS.error }]} onPress={() => handleStatusChange(booking, 'cancelled')}>
                            <Text style={[s.actionText, { color: COLORS.error }]}>Cancel Booking</Text>
                          </Pressable>
                        )}
                        {(booking.status === 'completed' || booking.status === 'cancelled') && (
                          <Text style={s.finalStatus}>
                            {booking.status === 'completed' ? '✅ Service completed' : '✗ Booking cancelled'}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ── STAFF TAB ── */}
        {tab === 'staff' && (
          <View style={s.section}>

            {/* Summary + Add button */}
            <View style={s.staffHeader}>
              <Text style={s.staffSummaryText}>
                {staffList.filter(st => st.available).length} of {staffList.length} available today
              </Text>
              <Pressable
                style={[s.addBtn, showAddForm && s.addBtnCancel]}
                onPress={() => { setShowAddForm(v => !v); setFormError(''); setForm({ ...BLANK_FORM }); }}
              >
                <Text style={s.addBtnText}>{showAddForm ? '✕ Cancel' : '+ Add Employee'}</Text>
              </Pressable>
            </View>

            {/* ── Add Employee Form ── */}
            {showAddForm && (
              <View style={s.formCard}>
                <Text style={s.formTitle}>New Employee</Text>

                {formError ? <Text style={s.formError}>{formError}</Text> : null}

                {/* Name */}
                <Text style={s.fieldLabel}>Full Name *</Text>
                <TextInput
                  style={s.fieldInput}
                  placeholder="e.g. Priya Sharma"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.name}
                  onChangeText={v => { setForm(f => ({ ...f, name: v })); setFormError(''); }}
                />

                {/* Role */}
                <Text style={s.fieldLabel}>Role / Title *</Text>
                <TextInput
                  style={s.fieldInput}
                  placeholder="e.g. Senior Stylist"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.role}
                  onChangeText={v => setForm(f => ({ ...f, role: v }))}
                />

                {/* Experience */}
                <Text style={s.fieldLabel}>Experience</Text>
                <TextInput
                  style={s.fieldInput}
                  placeholder="e.g. 4 years"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.experience}
                  onChangeText={v => setForm(f => ({ ...f, experience: v }))}
                />

                {/* Emoji */}
                <Text style={s.fieldLabel}>Pick an Emoji</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                  <View style={s.emojiRow}>
                    {EMOJI_OPTIONS.map(em => (
                      <Pressable
                        key={em}
                        style={[s.emojiPill, form.emoji === em && s.emojiPillActive]}
                        onPress={() => setForm(f => ({ ...f, emoji: em }))}
                      >
                        <Text style={s.emojiText}>{em}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>

                {/* Specialties */}
                <Text style={s.fieldLabel}>Specialties * (pick one or more)</Text>
                <View style={s.specialtyPicker}>
                  {SPECIALTY_OPTIONS.map(sp => (
                    <Pressable
                      key={sp}
                      style={[s.spTag, form.specialties.includes(sp) && s.spTagActive]}
                      onPress={() => toggleSpecialty(sp)}
                    >
                      <Text style={[s.spTagText, form.specialties.includes(sp) && s.spTagTextActive]}>{sp}</Text>
                    </Pressable>
                  ))}
                </View>

                {/* Availability */}
                <View style={s.availRow}>
                  <Text style={s.fieldLabel}>Available today</Text>
                  <Switch
                    value={form.available}
                    onValueChange={v => setForm(f => ({ ...f, available: v }))}
                    trackColor={{ false: COLORS.bgElevated, true: COLORS.primary }}
                    thumbColor={COLORS.bg}
                  />
                </View>

                <Pressable style={s.submitBtn} onPress={handleAddEmployee}>
                  <Text style={s.submitBtnText}>Add to Team</Text>
                </Pressable>
              </View>
            )}

            {/* Staff cards */}
            {staffList.length === 0 ? (
              <View style={s.empty}>
                <Text style={s.emptyIcon}>👤</Text>
                <Text style={s.emptyText}>No staff members yet</Text>
              </View>
            ) : (
              staffList.map(staff => (
                <View key={staff.id} style={s.staffCard}>
                  <View style={s.staffTop}>
                    <View style={s.staffAvatar}>
                      <Text style={{ fontSize: 26 }}>{staff.emoji}</Text>
                    </View>
                    <View style={s.staffInfo}>
                      <Text style={s.staffName}>{staff.name}</Text>
                      <Text style={s.staffRole}>{staff.role} · {staff.experience}</Text>
                      <View style={s.specialtyRow}>
                        {staff.specialties.map(sp => (
                          <View key={sp} style={s.specialtyTag}>
                            <Text style={s.specialtyText}>{sp}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    <View style={s.staffActions}>
                      <Pressable
                        style={[s.availBadge, { backgroundColor: staff.available ? COLORS.successBg : COLORS.errorBg }]}
                        onPress={() => toggleAvailability(staff.id)}
                      >
                        <Text style={[s.availText, { color: staff.available ? COLORS.success : COLORS.error }]}>
                          {staff.available ? 'Active' : 'Off'}
                        </Text>
                      </Pressable>
                      <Pressable style={s.removeBtn} onPress={() => removeStaff(staff.id)}>
                        <Text style={s.removeBtnText}>✕</Text>
                      </Pressable>
                    </View>
                  </View>

                  {Object.keys(staff.schedule).length > 0 && (
                    <View style={s.schedule}>
                      {Object.entries(staff.schedule).map(([day, hours]) =>
                        hours ? (
                          <View key={day} style={s.scheduleRow}>
                            <Text style={s.scheduleDay}>{day.charAt(0).toUpperCase() + day.slice(1, 3)}</Text>
                            <Text style={s.scheduleHours}>{hours.start} – {hours.end}</Text>
                          </View>
                        ) : null
                      )}
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  topBar: { paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { paddingVertical: 4, paddingRight: 12 },
  backText: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: COLORS.bgCard, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  headerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  logoutBtn: { borderWidth: 1, borderColor: COLORS.error, borderRadius: RADIUS.sm, paddingHorizontal: 12, paddingVertical: 5 },
  logoutText: { color: COLORS.error, fontSize: 13, fontWeight: '600' },

  statsRow: {
    flexDirection: 'row', backgroundColor: COLORS.bgCard,
    margin: 16, borderRadius: RADIUS.lg, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOW.card,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },

  tabs: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, borderRadius: RADIUS.md, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 11, alignItems: 'center', backgroundColor: COLORS.bgCard },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  tabTextActive: { color: COLORS.bg },

  section: { paddingHorizontal: 16, paddingTop: 4 },

  filterScroll: { marginBottom: 12 },
  filterRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: RADIUS.xxl, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bgCard },
  filterPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterPillText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
  filterPillTextActive: { color: COLORS.bg, fontWeight: '700' },

  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 15, color: COLORS.textMuted },

  bookingCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.card,
  },
  bookingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  bookingInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, flexWrap: 'wrap' },
  bookingId: { fontSize: 12, color: COLORS.textMuted, fontFamily: 'monospace' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.xxl },
  statusText: { fontSize: 12, fontWeight: '600' },
  bookingTotal: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  bookingServices: { fontSize: 13, color: COLORS.text, marginBottom: 8, lineHeight: 18 },
  bookingMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metaItem: { fontSize: 13, color: COLORS.textSecondary },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: RADIUS.md, borderWidth: 1, alignItems: 'center' },
  actionText: { fontSize: 13, fontWeight: '700' },
  finalStatus: { fontSize: 13, color: COLORS.textMuted, marginTop: 10, fontStyle: 'italic' },

  staffHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 4 },
  staffSummaryText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', flex: 1 },
  addBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnCancel: { backgroundColor: COLORS.bgElevated },
  addBtnText: { color: COLORS.bg, fontWeight: '700', fontSize: 13 },

  formCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: 18, marginBottom: 16, borderWidth: 1.5, borderColor: COLORS.primary, ...SHADOW.card,
  },
  formTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 14 },
  formError: { backgroundColor: COLORS.errorBg, color: COLORS.error, fontSize: 13, padding: 10, borderRadius: RADIUS.md, marginBottom: 12, textAlign: 'center' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 },
  fieldInput: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md,
    padding: 12, fontSize: 14, color: COLORS.text,
    backgroundColor: COLORS.bg, marginBottom: 14,
  },
  emojiRow: { flexDirection: 'row', gap: 8 },
  emojiPill: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  emojiPillActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryDim },
  emojiText: { fontSize: 22 },
  specialtyPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  spTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.xxl, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.bg },
  spTagActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryDim },
  spTagText: { fontSize: 13, color: COLORS.textMuted },
  spTagTextActive: { color: COLORS.primary, fontWeight: '700' },
  availRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 13, alignItems: 'center' },
  submitBtnText: { color: COLORS.bg, fontWeight: '800', fontSize: 15 },

  staffCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.card,
  },
  staffTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 6 },
  staffAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.primaryDim, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.primary },
  staffInfo: { flex: 1 },
  staffName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  staffRole: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  specialtyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  specialtyTag: { backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 3 },
  specialtyText: { fontSize: 11, color: COLORS.textSecondary },
  staffActions: { alignItems: 'flex-end', gap: 8 },
  availBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.xxl },
  availText: { fontSize: 12, fontWeight: '700' },
  removeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.errorBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.error },
  removeBtnText: { color: COLORS.error, fontSize: 12, fontWeight: '800' },
  schedule: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  scheduleRow: { flexDirection: 'row', gap: 6 },
  scheduleDay: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, width: 28 },
  scheduleHours: { fontSize: 12, color: COLORS.textSecondary },

  loginWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loginCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
    padding: 32, width: '100%', maxWidth: 380,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', ...SHADOW.card,
  },
  loginIcon: { fontSize: 48, marginBottom: 16 },
  loginTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  loginSub: { fontSize: 14, color: COLORS.textMuted, marginTop: 6, textAlign: 'center', marginBottom: 20 },
  loginError: { backgroundColor: COLORS.errorBg, color: COLORS.error, fontSize: 13, padding: 10, borderRadius: RADIUS.md, marginBottom: 12, width: '100%', textAlign: 'center' },
  input: {
    width: '100%', borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: RADIUS.md, padding: 14, fontSize: 15, color: COLORS.text,
    backgroundColor: COLORS.bg, marginBottom: 16,
  },
  loginBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 14, width: '100%', alignItems: 'center' },
  loginBtnText: { color: COLORS.bg, fontWeight: '800', fontSize: 15 },
});
