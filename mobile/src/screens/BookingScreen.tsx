import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  SafeAreaView, StatusBar,
} from 'react-native';
import { useCart } from '../CartContext';
import { useBookings } from '../BookingsContext';
import { QUASAR_STAFF, TIME_SLOTS, DEMO_BUSY_SLOTS, StaffMember } from '../quasarData';
import { COLORS, RADIUS } from '../theme';
import { BookingScreenProps } from '../navigation';

const DATES = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i + 1);
  return {
    label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
    iso: d.toISOString().split('T')[0],
  };
});

type Step = 'date' | 'time' | 'stylist' | 'confirm';

export default function BookingScreen({ navigation }: BookingScreenProps) {
  const { items, totalPrice, clearCart } = useCart();
  const { addBooking } = useBookings();
  const [step, setStep] = useState<Step>('date');
  const [selectedDate, setSelectedDate] = useState(DATES[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedStylist, setSelectedStylist] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(false);

  const availableStaff = QUASAR_STAFF.filter(staff => {
    if (!staff.available) return false;
    if (!selectedTime) return true;
    const busy = DEMO_BUSY_SLOTS[staff.id] || [];
    return !busy.includes(selectedTime);
  });

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const booking = addBooking({
      services: items,
      date: selectedDate.label,
      time: selectedTime,
      stylist: selectedStylist,
      total: totalPrice,
      status: 'confirmed',
    });
    clearCart();
    setLoading(false);
    navigation.navigate('BookingSuccess', { booking });
  };

  const STEPS: { key: Step; label: string; num: number }[] = [
    { key: 'date', label: 'Date', num: 1 },
    { key: 'time', label: 'Time', num: 2 },
    { key: 'stylist', label: 'Stylist', num: 3 },
    { key: 'confirm', label: 'Confirm', num: 4 },
  ];

  const stepIdx = STEPS.findIndex(s => s.key === step);

  const goBack = () => {
    if (step === 'date') { navigation.goBack(); return; }
    setStep(STEPS[stepIdx - 1].key);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <Pressable onPress={goBack}>
          <Text style={s.back}>←</Text>
        </Pressable>
        <Text style={s.headerTitle}>Book Appointment</Text>
      </View>

      <View style={s.stepRow}>
        {STEPS.map((st, i) => (
          <React.Fragment key={st.key}>
            <View style={s.stepItem}>
              <View style={[s.stepCircle, i <= stepIdx && s.stepCircleActive]}>
                <Text style={[s.stepNum, i <= stepIdx && s.stepNumActive]}>{st.num}</Text>
              </View>
              <Text style={[s.stepLabel, i === stepIdx && s.stepLabelActive]}>{st.label}</Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={[s.stepLine, i < stepIdx && s.stepLineActive]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>

        <View style={s.serviceStrip}>
          <Text style={s.serviceStripTitle}>
            {items.length} service{items.length > 1 ? 's' : ''} · ₹{totalPrice.toLocaleString('en-IN')}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {items.map(item => (
              <View key={item.service.id} style={s.serviceTag}>
                <Text style={s.serviceTagText} numberOfLines={1}>{item.service.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {step === 'date' && (
          <View>
            <Text style={s.stepTitle}>Select a Date</Text>
            {DATES.map(d => (
              <Pressable
                key={d.iso}
                onPress={() => setSelectedDate(d)}
                style={[s.dateRow, selectedDate.iso === d.iso && s.dateRowActive]}
              >
                <View style={[s.dateCircle, selectedDate.iso === d.iso && s.dateCircleActive]}>
                  <Text style={[s.dateCircleText, selectedDate.iso === d.iso && s.dateCircleTextActive]}>
                    {d.label.split(' ')[1]}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={[s.dateLabel, selectedDate.iso === d.iso && { color: COLORS.primary }]}>{d.label}</Text>
                </View>
                {selectedDate.iso === d.iso && <Text style={{ color: COLORS.primary, fontSize: 18 }}>✓</Text>}
              </Pressable>
            ))}
          </View>
        )}

        {step === 'time' && (
          <View>
            <Text style={s.stepTitle}>Select a Time Slot</Text>
            <Text style={s.stepSub}>{selectedDate.label}</Text>
            <View style={s.timeGrid}>
              {TIME_SLOTS.map(t => {
                const active = selectedTime === t;
                const freeCount = QUASAR_STAFF.filter(st => {
                  if (!st.available) return false;
                  return !(DEMO_BUSY_SLOTS[st.id] || []).includes(t);
                }).length;
                const noAvail = freeCount === 0;
                return (
                  <Pressable
                    key={t}
                    onPress={() => !noAvail && setSelectedTime(t)}
                    disabled={noAvail}
                    style={[s.timeChip, active && s.timeChipActive, noAvail && s.timeChipUnavail]}
                  >
                    <Text style={[s.timeText, active && s.timeTextActive, noAvail && s.timeTextDim]}>{t}</Text>
                    <Text style={[s.timeAvail, active && { color: COLORS.bg }, noAvail && s.timeTextDim]}>
                      {noAvail ? 'Full' : `${freeCount} free`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {step === 'stylist' && (
          <View>
            <Text style={s.stepTitle}>Choose Your Stylist</Text>
            <Text style={s.stepSub}>
              Available on {selectedDate.label} at {selectedTime}
              {' '}({availableStaff.length} stylists free)
            </Text>
            {QUASAR_STAFF.map(staff => {
              const isBusy = (DEMO_BUSY_SLOTS[staff.id] || []).includes(selectedTime) || !staff.available;
              const active = selectedStylist?.id === staff.id;
              return (
                <Pressable
                  key={staff.id}
                  onPress={() => !isBusy && setSelectedStylist(staff)}
                  disabled={isBusy}
                  style={[s.stylistCard, active && s.stylistCardActive, isBusy && s.stylistCardBusy]}
                >
                  <View style={[s.stylistEmoji, active && { backgroundColor: COLORS.primary }]}>
                    <Text style={{ fontSize: 28 }}>{staff.emoji}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={[s.stylistName, isBusy && s.textDim]}>{staff.name}</Text>
                    <Text style={s.stylistRole}>{staff.role}</Text>
                    <Text style={s.stylistExp}>{staff.experience} experience</Text>
                    <View style={s.specialtyRow}>
                      {staff.specialties.slice(0, 2).map(sp => (
                        <View key={sp} style={s.spTag}>
                          <Text style={s.spTagText} numberOfLines={1}>{sp}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View style={[s.availBadge, isBusy ? s.availBadgeOff : s.availBadgeOn]}>
                    <Text style={[s.availText, isBusy && { color: COLORS.error }]}>
                      {isBusy ? 'Busy' : 'Free'}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {step === 'confirm' && (
          <View>
            <Text style={s.stepTitle}>Booking Summary</Text>
            <View style={s.summaryBox}>
              <SumRow label="Date" value={selectedDate.label} />
              <SumRow label="Time" value={selectedTime} />
              <SumRow label="Stylist" value={selectedStylist?.name ?? 'Any Available'} />
              <View style={s.divider} />
              {items.map(item => (
                <View key={item.service.id} style={s.sumSvcRow}>
                  <Text style={s.sumSvcName} numberOfLines={2}>
                    {item.qty > 1 ? `${item.qty}× ` : ''}{item.service.name}
                  </Text>
                  <Text style={s.sumSvcPrice}>₹{(item.service.price * item.qty).toLocaleString('en-IN')}</Text>
                </View>
              ))}
              <View style={s.divider} />
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Grand Total</Text>
                <Text style={s.totalValue}>₹{totalPrice.toLocaleString('en-IN')}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={s.cta}>
        {step === 'date' && (
          <Pressable style={s.ctaBtn} onPress={() => setStep('time')}>
            <Text style={s.ctaBtnText}>Continue to Time →</Text>
          </Pressable>
        )}
        {step === 'time' && (
          <Pressable
            style={[s.ctaBtn, !selectedTime && s.ctaBtnDisabled]}
            disabled={!selectedTime}
            onPress={() => setStep('stylist')}
          >
            <Text style={s.ctaBtnText}>Choose Stylist →</Text>
          </Pressable>
        )}
        {step === 'stylist' && (
          <Pressable
            style={[s.ctaBtn, !selectedStylist && s.ctaBtnDisabled]}
            disabled={!selectedStylist}
            onPress={() => setStep('confirm')}
          >
            <Text style={s.ctaBtnText}>Review Booking →</Text>
          </Pressable>
        )}
        {step === 'confirm' && (
          <Pressable style={[s.ctaBtn, loading && { opacity: 0.7 }]} disabled={loading} onPress={handleConfirm}>
            <Text style={s.ctaBtnText}>
              {loading ? 'Confirming…' : `Confirm & Book · ₹${totalPrice.toLocaleString('en-IN')}`}
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

function SumRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.sumRow}>
      <Text style={s.sumLabel}>{label}</Text>
      <Text style={s.sumValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: COLORS.bgCard, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  back: { fontSize: 22, color: COLORS.primary, fontWeight: '700', marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  stepRow: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: COLORS.bgCard, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  stepItem: { alignItems: 'center' },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.bgElevated, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  stepCircleActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  stepNum: { fontSize: 12, fontWeight: '800', color: COLORS.textMuted },
  stepNumActive: { color: COLORS.bg },
  stepLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: 4 },
  stepLabelActive: { color: COLORS.primary, fontWeight: '700' },
  stepLine: { flex: 1, height: 1, backgroundColor: COLORS.border, marginHorizontal: 4, marginBottom: 14 },
  stepLineActive: { backgroundColor: COLORS.primary },
  serviceStrip: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: COLORS.primaryDim },
  serviceStripTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primary, marginBottom: 8 },
  serviceTag: { backgroundColor: COLORS.primaryDim, borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 4, marginRight: 8 },
  serviceTagText: { fontSize: 12, color: COLORS.primary },
  stepTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  stepSub: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 16 },
  dateRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  dateRowActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryDim },
  dateCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.bgElevated, alignItems: 'center', justifyContent: 'center' },
  dateCircleActive: { backgroundColor: COLORS.primary },
  dateCircleText: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  dateCircleTextActive: { color: COLORS.bg },
  dateLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: RADIUS.sm, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border, minWidth: 88, alignItems: 'center' },
  timeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  timeChipUnavail: { opacity: 0.4, borderStyle: 'dashed' },
  timeText: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  timeTextActive: { color: COLORS.bg, fontWeight: '700' },
  timeTextDim: { color: COLORS.textMuted },
  timeAvail: { fontSize: 10, color: COLORS.primary, marginTop: 3, fontWeight: '600' },
  stylistCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  stylistCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryDim },
  stylistCardBusy: { opacity: 0.45 },
  stylistEmoji: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.bgElevated, alignItems: 'center', justifyContent: 'center' },
  stylistName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  stylistRole: { fontSize: 13, color: COLORS.primary, marginTop: 2 },
  stylistExp: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  specialtyRow: { flexDirection: 'row', gap: 4, marginTop: 6, flexWrap: 'wrap' },
  spTag: { backgroundColor: COLORS.bgElevated, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  spTagText: { fontSize: 10, color: COLORS.textSecondary },
  textDim: { color: COLORS.textMuted },
  availBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  availBadgeOn: { backgroundColor: '#0A2010' },
  availBadgeOff: { backgroundColor: COLORS.errorBg },
  availText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  summaryBox: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: 20, borderWidth: 1, borderColor: COLORS.border },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  sumLabel: { fontSize: 14, color: COLORS.textSecondary },
  sumValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  sumSvcRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  sumSvcName: { fontSize: 13, color: COLORS.text, flex: 1, marginRight: 10 },
  sumSvcPrice: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  totalValue: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  cta: { backgroundColor: COLORS.bgCard, borderTopWidth: 1, borderTopColor: COLORS.border, padding: 16 },
  ctaBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: 16, alignItems: 'center' },
  ctaBtnDisabled: { backgroundColor: COLORS.bgElevated },
  ctaBtnText: { color: COLORS.bg, fontSize: 15, fontWeight: '800' },
});
