import React, { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { COLORS, RADIUS, SHADOW } from '../theme';
import { TIME_SLOTS, StaffMember } from '../quasarData';

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface DateItem {
  label: string;
  iso: string;
}

interface Props {
  selectedDate: DateItem | null;
  selectedTime: string;
  onDateChange: (date: DateItem) => void;
  onTimeChange: (time: string) => void;
  staffList: StaffMember[];
  getFreeCount: (time: string) => number;
  slotsLoading: boolean;
}

function isoFromDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function labelFromDate(d: Date): string {
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function buildCalendarGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function CalendarTimePicker({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  getFreeCount,
  slotsLoading,
}: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 60);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const cells = buildCalendarGrid(viewYear, viewMonth);

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const canGoPrev = !(viewYear === today.getFullYear() && viewMonth === today.getMonth());
  const canGoNext = !(
    viewYear === maxDate.getFullYear() && viewMonth === maxDate.getMonth()
  );

  const prevMonth = () => {
    if (!canGoPrev) return;
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (!canGoNext) return;
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const handleDayPress = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    if (d <= today || d > maxDate) return;
    onDateChange({ label: labelFromDate(d), iso: isoFromDate(d) });
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const d = new Date(viewYear, viewMonth, day);
    return isoFromDate(d) === selectedDate.iso;
  };

  const isDisabled = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    return d <= today || d > maxDate;
  };

  const isToday = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  };

  return (
    <View style={s.container}>

      {/* ── Month Calendar ── */}
      <View style={s.card}>
        {/* Month nav */}
        <View style={s.monthNav}>
          <Pressable
            onPress={prevMonth}
            style={[s.navBtn, !canGoPrev && s.navBtnDisabled]}
            disabled={!canGoPrev}
          >
            <Text style={[s.navArrow, !canGoPrev && s.navArrowDisabled]}>‹</Text>
          </Pressable>
          <Text style={s.monthLabel}>{monthLabel}</Text>
          <Pressable
            onPress={nextMonth}
            style={[s.navBtn, !canGoNext && s.navBtnDisabled]}
            disabled={!canGoNext}
          >
            <Text style={[s.navArrow, !canGoNext && s.navArrowDisabled]}>›</Text>
          </Pressable>
        </View>

        {/* Day-of-week headers */}
        <View style={s.weekRow}>
          {DAYS_OF_WEEK.map(d => (
            <View key={d} style={s.dayHeaderCell}>
              <Text style={s.dayHeaderText}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={s.grid}>
          {cells.map((day, idx) => {
            if (!day) {
              return <View key={`empty-${idx}`} style={s.dayCell} />;
            }
            const selected = isSelected(day);
            const disabled = isDisabled(day);
            const todayCell = isToday(day);
            return (
              <Pressable
                key={`day-${day}`}
                style={s.dayCell}
                onPress={() => !disabled && handleDayPress(day)}
                disabled={disabled}
              >
                <View style={[
                  s.dayInner,
                  selected && s.daySelected,
                  todayCell && !selected && s.dayToday,
                ]}>
                  <Text style={[
                    s.dayText,
                    selected && s.dayTextSelected,
                    disabled && s.dayTextDisabled,
                    todayCell && !selected && s.dayTextToday,
                  ]}>
                    {day}
                  </Text>
                  {todayCell && !selected && <View style={s.todayDot} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        {selectedDate && (
          <View style={s.selectedDateBanner}>
            <Text style={s.selectedDateText}>📅  {selectedDate.label}</Text>
          </View>
        )}
      </View>

      {/* ── Time Slots ── */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>Select a Time</Text>

        {slotsLoading ? (
          <View style={s.loadingRow}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={s.loadingText}>Checking availability…</Text>
          </View>
        ) : (
          <View style={s.timeGrid}>
            {TIME_SLOTS.map(slot => {
              const active = selectedTime === slot;
              const freeCount = getFreeCount(slot);
              const unavail = freeCount === 0;
              return (
                <Pressable
                  key={slot}
                  onPress={() => !unavail && onTimeChange(slot)}
                  disabled={unavail}
                  style={[
                    s.timeChip,
                    active && s.timeChipActive,
                    unavail && s.timeChipUnavail,
                  ]}
                >
                  <Text style={[
                    s.timeText,
                    active && s.timeTextActive,
                    unavail && s.timeTextDim,
                  ]}>
                    {slot}
                  </Text>
                  <Text style={[
                    s.timeAvail,
                    active && s.timeAvailActive,
                    unavail && s.timeTextDim,
                  ]}>
                    {unavail ? 'Full' : `${freeCount} free`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

    </View>
  );
}

const s = StyleSheet.create({
  container: { gap: 14 },

  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    ...SHADOW.card,
  },

  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  navBtnDisabled: { opacity: 0.3 },
  navArrow: { fontSize: 22, color: COLORS.text, lineHeight: 26, fontWeight: '300' },
  navArrowDisabled: { color: COLORS.textMuted },
  monthLabel: { fontSize: 16, fontWeight: '700', color: COLORS.text },

  weekRow: { flexDirection: 'row', marginBottom: 6 },
  dayHeaderCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  dayHeaderText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.285%', alignItems: 'center', paddingVertical: 3 },
  dayInner: {
    width: 36, height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: { backgroundColor: COLORS.primary },
  dayToday: { borderWidth: 1.5, borderColor: COLORS.primary },
  dayText: { fontSize: 14, color: COLORS.text, fontWeight: '400' },
  dayTextSelected: { color: COLORS.bg, fontWeight: '700' },
  dayTextDisabled: { color: COLORS.borderLight },
  dayTextToday: { color: COLORS.primary, fontWeight: '700' },
  todayDot: {
    position: 'absolute',
    bottom: 3,
    width: 4, height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },

  selectedDateBanner: {
    marginTop: 14,
    backgroundColor: COLORS.primaryDim,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  selectedDateText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 14 },

  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 16 },
  loadingText: { fontSize: 14, color: COLORS.textMuted },

  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: {
    width: '30.5%',
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
  },
  timeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeChipUnavail: {
    backgroundColor: COLORS.bgElevated,
    borderColor: COLORS.borderLight,
    opacity: 0.6,
  },
  timeText: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  timeTextActive: { color: COLORS.bg },
  timeTextDim: { color: COLORS.textMuted },
  timeAvail: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  timeAvailActive: { color: 'rgba(255,255,255,0.85)' },
});
