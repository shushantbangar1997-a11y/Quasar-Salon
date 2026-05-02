import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  SafeAreaView, StatusBar, ActivityIndicator,
} from 'react-native';
import { useCart } from '../CartContext';
import { useStaff } from '../StaffContext';
import { StaffMember } from '../quasarData';
import { COLORS, RADIUS } from '../theme';
import { BookingScreenProps } from '../navigation';
import {
  ApiError,
  fetchStaffSlots,
  createQuasarBooking,
  buildQuasarBookingPayload,
} from '../api';
import CalendarTimePicker from '../components/CalendarTimePicker';
import { Skeleton, SkeletonImage } from '../components/Skeleton';

type Step = 'date' | 'stylist' | 'confirm';

export default function BookingScreen({ navigation, route }: BookingScreenProps) {
  const { guests, totalPrice, clearCart } = useCart();
  const allItems = guests.flatMap(g => g.items);

  const reschedule = route?.params?.reschedule;

  const toDateItem = (iso: string) => {
    const d = new Date(iso);
    return {
      label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
      iso,
    };
  };

  const initialDate = reschedule?.dateIso ? toDateItem(reschedule.dateIso) : null;

  const [step, setStep] = useState<Step>('date');
  const [selectedDate, setSelectedDate] = useState<{ label: string; iso: string } | null>(initialDate);
  const [selectedTime, setSelectedTime] = useState(reschedule?.timeSlot ?? '');
  const [selectedStylist, setSelectedStylist] = useState<StaffMember | null>(
    reschedule?.stylist ?? null
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { staffList } = useStaff();
  const [staffLoading] = useState(false);
  const [slotMap, setSlotMap] = useState<Record<string, string[]>>({});
  const [slotsLoading, setSlotsLoading] = useState(false);

  const totalDuration = allItems.reduce((sum, item) => sum + item.service.durationMins * item.qty, 0);

  /** Fetch slots for ALL staff when advancing to time step, honoring total service duration */
  const fetchSlotsForDate = useCallback(async (dateIso: string) => {
    setSlotsLoading(true);
    try {
      const results = await Promise.allSettled(
        staffList.map(st => fetchStaffSlots(st.id, dateIso, totalDuration || undefined))
      );
      const map: Record<string, string[]> = {};
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          map[staffList[i].id] = r.value.slots;
        }
      });
      setSlotMap(map);
    } catch {
      setSlotMap({});
    } finally {
      setSlotsLoading(false);
    }
  }, [staffList, totalDuration]);

  const advanceToStylist = () => {
    if (selectedDate) fetchSlotsForDate(selectedDate.iso);
    setStep('stylist');
  };

  /** Check if a staff member is available at a given time, based on the API-loaded slot map. */
  const isStaffAvailableAtTime = (staff: StaffMember, time: string): boolean => {
    if (!staff.available) return false;
    const slots = slotMap[staff.id];
    // While slots are loading or unavailable for this staff, treat as not bookable for this time
    if (!slots) return false;
    return slots.includes(time);
  };

  const availableStaff = staffList.filter(staff => {
    if (!staff.available) return false;
    if (!selectedTime) return true;
    return isStaffAvailableAtTime(staff, selectedTime);
  });

  const [lastErrorRetryable, setLastErrorRetryable] = useState(false);

  /** Confirm booking — always calls the backend; on failure surfaces the error and stays on Confirm. */
  const handleConfirm = async () => {
    if (allItems.length === 0) {
      setErrorMsg('Your cart is empty. Please add services before booking.');
      setLastErrorRetryable(false);
      return;
    }
    if (!selectedStylist || !selectedDate || !selectedTime) {
      setErrorMsg('Please pick a date, time, and stylist before confirming.');
      setLastErrorRetryable(false);
      return;
    }

    setErrorMsg(null);
    setLastErrorRetryable(false);
    setLoading(true);

    try {
      // Re-check slot is still available (duration-aware) before submitting
      const freshAvailability = await fetchStaffSlots(selectedStylist.id, selectedDate.iso, totalDuration || undefined);
      if (!freshAvailability.slots.includes(selectedTime)) {
        setLoading(false);
        setErrorMsg('This time slot was just taken. Please choose a different time.');
        setLastErrorRetryable(false);
        setSelectedTime('');
        setStep('date');
        return;
      }

      const payload = buildQuasarBookingPayload(
        guests,
        selectedStylist.id,
        selectedTime,
        selectedDate.iso,
        selectedDate.label,
        totalPrice
      );
      const result = await createQuasarBooking(payload);

      const guestsWithItemsLocal = guests.filter(g => g.items.length > 0);
      const bookingGuests = guestsWithItemsLocal.length > 1
        ? guestsWithItemsLocal.map(g => ({ name: g.name, services: g.items }))
        : undefined;

      const booking = {
        id: result.id,
        services: allItems,
        guests: bookingGuests,
        date: selectedDate.label,
        dateIso: selectedDate.iso,
        time: selectedTime,
        stylist: selectedStylist,
        total: totalPrice,
        status: 'confirmed' as const,
        createdAt: Date.now(),
      };

      clearCart();
      setLoading(false);
      navigation.navigate('BookingSuccess', { booking });
    } catch (e: unknown) {
      setLoading(false);
      if (e instanceof ApiError) {
        if (e.status === 409) {
          setErrorMsg('This time slot was just booked by someone else. Please choose a different time.');
          setLastErrorRetryable(false);
          setSelectedTime('');
          setStep('date');
        } else if (e.status === 401) {
          setErrorMsg('Please sign in to confirm your booking.');
          setLastErrorRetryable(false);
        } else {
          // 5xx + other transient backend errors — let the user retry in one tap
          setErrorMsg(e.message || 'Something went wrong. Please try again.');
          setLastErrorRetryable(e.status >= 500 || e.status === 0);
        }
        return;
      }
      setErrorMsg('Network error — please check your connection and try again.');
      setLastErrorRetryable(true);
    }
  };

  const STEPS: { key: Step; label: string; num: number }[] = [
    { key: 'date', label: 'Date & Time', num: 1 },
    { key: 'stylist', label: 'Stylist', num: 2 },
    { key: 'confirm', label: 'Confirm', num: 3 },
  ];

  const stepIdx = STEPS.findIndex(s => s.key === step);

  const goBack = () => {
    if (step === 'date') { navigation.goBack(); return; }
    setStep(STEPS[stepIdx - 1].key);
  };

  const guestsWithItems = guests.filter(g => g.items.length > 0);
  const isMultiGuest = guestsWithItems.length > 1;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <Pressable onPress={goBack}>
          <Text style={s.back}>←</Text>
        </Pressable>
        <Text style={s.headerTitle}>Book Appointment</Text>
        {staffLoading && <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 8 }} />}
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
            {allItems.length} service{allItems.length > 1 ? 's' : ''}
            {isMultiGuest ? ` · ${guestsWithItems.length} guests` : ''} · ₹{totalPrice.toLocaleString('en-IN')}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {allItems.map((item, idx) => (
              <View key={`${item.service.id}-${idx}`} style={s.serviceTag}>
                <Text style={s.serviceTagText} numberOfLines={1}>{item.service.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {step === 'date' && (
          <CalendarTimePicker
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateChange={d => {
              setSelectedDate(d);
              fetchSlotsForDate(d.iso);
            }}
            onTimeChange={setSelectedTime}
            staffList={staffList}
            getFreeCount={t => staffList.filter(st => isStaffAvailableAtTime(st, t)).length}
            slotsLoading={slotsLoading}
          />
        )}

        {step === 'stylist' && (
          <View>
            <Text style={s.stepTitle}>Choose Your Stylist</Text>
            <Text style={s.stepSub}>
              Available on {selectedDate?.label} at {selectedTime}
              {' '}({availableStaff.length} stylist{availableStaff.length !== 1 ? 's' : ''} free)
              <Text style={{ color: COLORS.primary }}> · Live</Text>
            </Text>
            {staffList.map(staff => {
              const isBusy = !isStaffAvailableAtTime(staff, selectedTime);
              const active = selectedStylist?.id === staff.id;
              return (
                <StylistCard
                  key={staff.id}
                  staff={staff}
                  isBusy={isBusy}
                  active={active}
                  onSelect={() => !isBusy && setSelectedStylist(staff)}
                />
              );
            })}
          </View>
        )}

        {step === 'confirm' && (
          <View>
            <Text style={s.stepTitle}>Booking Summary</Text>
            <View style={s.liveNotice}>
              <Text style={s.liveNoticeText}>🔒 Your slot will be locked in real time on confirmation</Text>
            </View>
            <View style={s.summaryBox}>
              <SumRow label="Date" value={selectedDate?.label ?? ''} />
              <SumRow label="Time" value={selectedTime} />
              <SumRow label="Stylist" value={selectedStylist?.name ?? 'Any Available'} />
              <View style={s.divider} />
              {guestsWithItems.map((g, gi) => (
                <React.Fragment key={g.id}>
                  {isMultiGuest && (
                    <Text style={s.sumGuestLabel}>{g.name}</Text>
                  )}
                  {g.items.map(item => (
                    <View key={`${gi}-${item.service.id}`} style={s.sumSvcRow}>
                      <Text style={s.sumSvcName} numberOfLines={2}>
                        {item.qty > 1 ? `${item.qty}× ` : ''}{item.service.name}
                      </Text>
                      <Text style={s.sumSvcPrice}>₹{(item.service.price * item.qty).toLocaleString('en-IN')}</Text>
                    </View>
                  ))}
                </React.Fragment>
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
        {errorMsg ? (
          <View style={s.errorBox}>
            <Text style={s.errorText}>⚠ {errorMsg}</Text>
            {lastErrorRetryable && step === 'confirm' && !loading ? (
              <Pressable style={s.retryBtn} onPress={handleConfirm}>
                <Text style={s.retryBtnText}>Retry</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
        {step === 'date' && (
          <Pressable
            style={[s.ctaBtn, (!selectedDate || !selectedTime) && s.ctaBtnDisabled]}
            disabled={!selectedDate || !selectedTime}
            onPress={advanceToStylist}
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
            {loading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator size="small" color={COLORS.bg} />
                <Text style={s.ctaBtnText}>Confirming…</Text>
              </View>
            ) : (
              <Text style={s.ctaBtnText}>{`Confirm & Book · ₹${totalPrice.toLocaleString('en-IN')}`}</Text>
            )}
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

function StylistCard({
  staff,
  isBusy,
  active,
  onSelect,
}: {
  staff: StaffMember;
  isBusy: boolean;
  active: boolean;
  onSelect: () => void;
}) {
  const hasPhoto = !!staff.photoUri;
  const [photoReady, setPhotoReady] = useState(!hasPhoto);

  return (
    <Pressable
      onPress={onSelect}
      disabled={isBusy}
      style={[s.stylistCard, active && s.stylistCardActive, isBusy && s.stylistCardBusy]}
    >
      <View style={[s.stylistEmoji, active && { backgroundColor: COLORS.primary }]}>
        {hasPhoto ? (
          <SkeletonImage
            source={{ uri: staff.photoUri! }}
            style={s.stylistPhoto}
            radius={28}
            resizeMode="cover"
            onLoad={() => setPhotoReady(true)}
            onError={() => setPhotoReady(true)}
            fallback={
              <View style={s.stylistEmojiFallback}>
                <Text style={{ fontSize: 28 }}>{staff.emoji}</Text>
              </View>
            }
          />
        ) : (
          <Text style={{ fontSize: 28 }}>{staff.emoji}</Text>
        )}
      </View>
      <View style={{ flex: 1, marginLeft: 14 }}>
        {photoReady ? (
          <>
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
          </>
        ) : (
          <>
            <Skeleton width={140} height={14} radius={4} />
            <Skeleton width={100} height={11} radius={4} style={{ marginTop: 6 }} />
            <Skeleton width={80} height={11} radius={4} style={{ marginTop: 6 }} />
            <View style={[s.specialtyRow, { marginTop: 8 }]}>
              <Skeleton width={56} height={16} radius={6} />
              <Skeleton width={56} height={16} radius={6} />
            </View>
          </>
        )}
      </View>
      <View style={[s.availBadge, isBusy ? s.availBadgeOff : s.availBadgeOn]}>
        <Text style={[s.availText, isBusy && { color: COLORS.error }]}>
          {isBusy ? 'Busy' : 'Free'}
        </Text>
      </View>
    </Pressable>
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
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800', color: COLORS.text },
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
  loadingBox: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { color: COLORS.textSecondary, marginTop: 12, fontSize: 14 },
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
  stylistEmoji: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.bgElevated, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  stylistPhoto: { width: 56, height: 56, borderRadius: 28 },
  stylistEmojiFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bgElevated, borderRadius: 28 },
  stylistName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  stylistRole: { fontSize: 13, color: COLORS.primary, marginTop: 2 },
  stylistExp: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  specialtyRow: { flexDirection: 'row', gap: 4, marginTop: 6, flexWrap: 'wrap' },
  spTag: { backgroundColor: COLORS.bgElevated, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  spTagText: { fontSize: 10, color: COLORS.textSecondary },
  textDim: { color: COLORS.textMuted },
  availBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  availBadgeOn: { backgroundColor: COLORS.successBg },
  availBadgeOff: { backgroundColor: COLORS.errorBg },
  availText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  liveNotice: { backgroundColor: COLORS.primaryDim, borderRadius: RADIUS.md, padding: 10, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  liveNoticeText: { fontSize: 12, color: COLORS.primary, textAlign: 'center' },
  summaryBox: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: 20, borderWidth: 1, borderColor: COLORS.border },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  sumLabel: { fontSize: 14, color: COLORS.textSecondary },
  sumValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  sumSvcRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  sumGuestLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: 8,
  },
  sumSvcName: { fontSize: 13, color: COLORS.text, flex: 1, marginRight: 10 },
  sumSvcPrice: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  totalValue: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  cta: { backgroundColor: COLORS.bgCard, borderTopWidth: 1, borderTopColor: COLORS.border, padding: 16 },
  ctaBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: 16, alignItems: 'center' },
  ctaBtnDisabled: { backgroundColor: COLORS.bgElevated },
  ctaBtnText: { color: COLORS.bg, fontSize: 15, fontWeight: '800' },
  errorBox: { backgroundColor: COLORS.errorBg, borderRadius: RADIUS.md, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.error },
  errorText: { color: COLORS.error, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  retryBtn: { marginTop: 10, alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.sm, backgroundColor: COLORS.error },
  retryBtnText: { color: COLORS.bg, fontSize: 13, fontWeight: '700' },
});
