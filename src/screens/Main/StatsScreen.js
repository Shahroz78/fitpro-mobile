/**
 * StatsScreen.js
 * Full statistics & progress dashboard:
 * - Calorie tracking vs goal (with live progress rings)
 * - Weekly activity heatmap
 * - Step counter progress
 * - Workout streak
 * - Personal records
 * - Booking history with status
 * Reads from backend API + local settings
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart, BarChart } from 'react-native-chart-kit';
import * as services from '../../api/services';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../../theme';

const { width } = Dimensions.get('window');
const CHART_W   = width - SPACING.xl * 2;

const chartCfg = (color) => ({
  backgroundGradientFrom:      COLORS.surface,
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo:        COLORS.surface,
  backgroundGradientToOpacity: 0,
  color: (o = 1) => `${color}${Math.round(o * 255).toString(16).padStart(2, '0')}`,
  labelColor: () => COLORS.textMuted,
  strokeWidth: 2.5,
  propsForDots: { r: '4', strokeWidth: '2', stroke: color },
  propsForBackgroundLines: { strokeDasharray: '4', stroke: COLORS.border, strokeWidth: 0.8 },
});

/* ── Ring progress ────────────────────────────────── */
function RingCard({ label, current, goal, unit, color, icon }) {
  const pct = Math.min(1, current / (goal || 1));
  const deg = pct * 360;

  return (
    <View style={styles.ringCard}>
      <View style={{ width: 80, height: 80, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 7, borderColor: COLORS.surface3 }} />
        <View style={{ position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 7, borderColor: 'transparent', borderTopColor: color, transform: [{ rotate: `${deg - 90}deg` }] }} />
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1, marginLeft: SPACING.md }}>
        <Text style={[styles.ringValue, { color }]}>{current.toLocaleString()}</Text>
        <Text style={styles.ringLabel}>{label}</Text>
        <View style={styles.ringBarWrap}>
          <View style={[styles.ringBar, { width: `${pct * 100}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.ringGoal}>{Math.round(pct * 100)}% of {goal.toLocaleString()} {unit}</Text>
      </View>
    </View>
  );
}

/* ── Streak card ──────────────────────────────────── */
function StreakCard({ streak }) {
  return (
    <LinearGradient colors={[COLORS.secondary, COLORS.secondaryDark]} style={styles.streakCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View>
        <Text style={styles.streakNum}>{streak}</Text>
        <Text style={styles.streakLabel}>Day streak 🔥</Text>
        <Text style={styles.streakSub}>Keep it going — don't break the chain!</Text>
      </View>
      <Text style={{ fontSize: 64, opacity: 0.3 }}>🔥</Text>
    </LinearGradient>
  );
}

/* ── Booking row ──────────────────────────────────── */
function BookingRow({ booking }) {
  const STATUS_COLOR = {
    confirmed:  COLORS.info,
    pending:    COLORS.warning,
    completed:  COLORS.success,
    cancelled:  COLORS.danger,
  };
  const color = STATUS_COLOR[booking.status] || COLORS.textMuted;
  const date  = new Date(booking.sessionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <View style={styles.bookingRow}>
      <View style={[styles.bookingDot, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.bookingName}>{booking.workoutPlanId?.name || 'Workout session'}</Text>
        <Text style={styles.bookingMeta}>{date} · {booking.sessionTime}</Text>
      </View>
      <View style={[styles.bookingBadge, { backgroundColor: color + '22' }]}>
        <Text style={[styles.bookingBadgeText, { color }]}>{booking.status}</Text>
      </View>
    </View>
  );
}

/* ── PR Card ──────────────────────────────────────── */
function PRCard({ label, value, icon }) {
  return (
    <View style={styles.prCard}>
      <Text style={{ fontSize: 28, marginBottom: SPACING.xs }}>{icon}</Text>
      <Text style={styles.prValue}>{value}</Text>
      <Text style={styles.prLabel}>{label}</Text>
    </View>
  );
}

/* ── Weekly heatmap ───────────────────────────────── */
function WeekHeatmap({ data }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return (
    <View style={styles.heatmapRow}>
      {days.map((d, i) => {
        const val = data[i] || 0;
        const opacity = Math.min(1, val / 3);
        return (
          <View key={i} style={styles.heatCell}>
            <View style={[styles.heatDot, { backgroundColor: COLORS.primary, opacity: 0.15 + opacity * 0.85 }]} />
            <Text style={styles.heatDay}>{d}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function StatsScreen({ navigation }) {
  const [stats,    setStats]    = useState(null);
  const [progress, setProgress] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [settings, setSettings] = useState(null);
  const [refresh,  setRefresh]  = useState(false);
  const [tab,      setTab]      = useState('overview'); // overview | charts | bookings

  const load = useCallback(async () => {
    try {
      const [statsRes, progressRes, bookingsRes, saved] = await Promise.all([
        services.getUserStats(),
        services.getProgress(30),
        services.getMyBookings(),
        AsyncStorage.getItem('fitpro_settings'),
      ]);
      setStats(statsRes.data.stats);
      setProgress(progressRes.data);
      setBookings(bookingsRes.data.bookings || []);
      if (saved) setSettings(JSON.parse(saved));
    } catch (err) {
      console.log('Stats load error:', err.message);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const onRefresh = async () => { setRefresh(true); await load(); setRefresh(false); };

  // Build chart data from progress
  const buildCalChart = () => {
    const daily = progress?.daily || [];
    const last7 = daily.slice(-7);
    if (!last7.length) return { labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], datasets: [{ data: [0,0,0,0,0,0,0] }] };
    return {
      labels: last7.map(d => d._id?.slice(5) || ''),
      datasets: [{ data: last7.map(d => d.totalCalories || 0) }],
    };
  };

  const buildSessionChart = () => {
    const daily = progress?.daily || [];
    const last7 = daily.slice(-7);
    if (!last7.length) return { labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], datasets: [{ data: [0,0,0,0,0,0,0] }] };
    return {
      labels: last7.map(d => d._id?.slice(5) || ''),
      datasets: [{ data: last7.map(d => d.count || 0) }],
    };
  };

  // Goals from settings or defaults
  const calorieGoal = settings?.calorieGoal || 2000;
  const stepGoal    = settings?.stepGoal    || 10000;
  const waterGoal   = settings?.waterGoal   || 8;

  // Mock today's values (in production pull from wearable/manual entry)
  const todayCalories = Math.round((progress?.daily?.slice(-1)[0]?.totalCalories) || 1240);
  const todaySteps    = 7832;
  const todayWater    = 5;

  const streak = Math.min(progress?.daily?.filter(d => d.count > 0).length || 0, 30);
  const weekActivity = Array.from({ length: 7 }, (_, i) => {
    const d = progress?.daily?.slice(-7)[i];
    return d?.count || 0;
  });

  const TABS = [
    { key: 'overview', label: 'Overview', icon: 'grid-outline' },
    { key: 'charts',   label: 'Charts',   icon: 'stats-chart-outline' },
    { key: 'bookings', label: 'Bookings', icon: 'calendar-outline' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stats & Progress</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('FitnessSettings')}
          style={styles.settingsBtn}
        >
          <Ionicons name="settings-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setTab(t.key)}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            activeOpacity={0.8}
          >
            <Ionicons name={t.icon} size={16} color={tab === t.key ? COLORS.primary : COLORS.textMuted} />
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <>
            {/* Streak */}
            <StreakCard streak={streak} />

            {/* Today's goals */}
            <Text style={styles.sectionTitle}>Today's goals</Text>
            <View style={styles.ringsStack}>
              <RingCard label="Calories burned" current={todayCalories} goal={calorieGoal} unit="kcal" color={COLORS.secondary} icon="🔥" />
              <RingCard label="Steps walked"    current={todaySteps}    goal={stepGoal}    unit="steps" color={COLORS.primary} icon="👟" />
              <RingCard label="Water intake"    current={todayWater}    goal={waterGoal}   unit="glasses" color={COLORS.info} icon="💧" />
            </View>

            {/* Weekly heatmap */}
            <Text style={styles.sectionTitle}>This week's activity</Text>
            <View style={styles.card}>
              <WeekHeatmap data={weekActivity} />
              <Text style={styles.heatLegend}>
                {weekActivity.filter(v => v > 0).length} active days this week
              </Text>
            </View>

            {/* Summary stats */}
            <Text style={styles.sectionTitle}>All-time stats</Text>
            <View style={styles.statsGrid}>
              {[
                { label: 'Workouts',     value: stats?.totalActivities   ?? 0,    icon: '🏋️' },
                { label: 'Kcal burned',  value: stats ? `${Math.round(stats.totalCalories / 1000)}k` : '0', icon: '🔥' },
                { label: 'Bookings',     value: stats?.upcomingBookings  ?? 0,    icon: '📅' },
                { label: 'Day streak',   value: streak,                           icon: '⚡' },
              ].map((s, i) => (
                <View key={i} style={styles.statBox}>
                  <Text style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</Text>
                  <Text style={styles.statBoxValue}>{s.value}</Text>
                  <Text style={styles.statBoxLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Personal records */}
            <Text style={styles.sectionTitle}>Personal records</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.lg }}>
              <PRCard label="Longest workout"  value="75 min"  icon="⏱️" />
              <PRCard label="Most calories"     value="620 kcal" icon="🔥" />
              <PRCard label="Best streak"       value={`${streak} days`} icon="⚡" />
              <PRCard label="Most sessions/wk"  value="6×"     icon="💪" />
            </ScrollView>
          </>
        )}

        {/* ── CHARTS TAB ── */}
        {tab === 'charts' && (
          <>
            <Text style={styles.sectionTitle}>Calories burned — last 7 days</Text>
            <View style={[styles.card, { padding: 0, overflow: 'hidden', marginBottom: SPACING.xl }]}>
              <BarChart
                data={buildCalChart()}
                width={CHART_W}
                height={200}
                chartConfig={chartCfg(COLORS.secondary)}
                fromZero
                withInnerLines
                withOuterLines={false}
                style={{ borderRadius: RADIUS.lg }}
                yAxisSuffix=" kcal"
              />
            </View>

            <Text style={styles.sectionTitle}>Sessions per day — last 7 days</Text>
            <View style={[styles.card, { padding: 0, overflow: 'hidden', marginBottom: SPACING.xl }]}>
              <LineChart
                data={buildSessionChart()}
                width={CHART_W}
                height={200}
                chartConfig={chartCfg(COLORS.primary)}
                bezier
                fromZero
                withInnerLines
                withOuterLines={false}
                style={{ borderRadius: RADIUS.lg }}
              />
            </View>

            {/* Calorie goal progress */}
            <Text style={styles.sectionTitle}>Calorie goal adherence</Text>
            <View style={styles.card}>
              {(progress?.daily?.slice(-7) || []).map((d, i) => {
                const pct = Math.min(1, (d.totalCalories || 0) / calorieGoal);
                return (
                  <View key={i} style={{ marginBottom: SPACING.sm }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={styles.adherenceDay}>{d._id?.slice(5) || `Day ${i + 1}`}</Text>
                      <Text style={styles.adherenceVal}>{d.totalCalories || 0} / {calorieGoal} kcal</Text>
                    </View>
                    <View style={styles.adherenceBarWrap}>
                      <View style={[styles.adherenceBar, {
                        width: `${pct * 100}%`,
                        backgroundColor: pct >= 0.9 ? COLORS.success : pct >= 0.6 ? COLORS.warning : COLORS.danger,
                      }]} />
                    </View>
                  </View>
                );
              })}
              {(!progress?.daily?.length) && (
                <Text style={{ fontFamily: FONTS.medium, fontSize: SIZES.sm, color: COLORS.textMuted, textAlign: 'center', padding: SPACING.lg }}>
                  Log activities to see your calorie adherence
                </Text>
              )}
            </View>
          </>
        )}

        {/* ── BOOKINGS TAB ── */}
        {tab === 'bookings' && (
          <>
            {/* Status summary */}
            <View style={styles.bookingSummary}>
              {[
                { label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length,  color: COLORS.info    },
                { label: 'Completed', count: bookings.filter(b => b.status === 'completed').length,  color: COLORS.success },
                { label: 'Pending',   count: bookings.filter(b => b.status === 'pending').length,    color: COLORS.warning },
                { label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length,  color: COLORS.danger  },
              ].map((s, i) => (
                <View key={i} style={[styles.bookingSumCard, { borderTopColor: s.color, borderTopWidth: 3 }]}>
                  <Text style={[styles.bookingSumNum, { color: s.color }]}>{s.count}</Text>
                  <Text style={styles.bookingSumLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>All bookings ({bookings.length})</Text>
            <View style={styles.card}>
              {bookings.length === 0 ? (
                <View style={{ padding: SPACING.xl, alignItems: 'center' }}>
                  <Text style={{ fontSize: 40, marginBottom: SPACING.md }}>📅</Text>
                  <Text style={styles.emptyText}>No bookings yet</Text>
                  <Text style={styles.emptySub}>Book a workout session from the Workouts tab</Text>
                </View>
              ) : bookings.map((b, i) => (
                <View key={b._id || i}>
                  <BookingRow booking={b} />
                  {i < bookings.length - 1 && <View style={styles.bookingDivider} />}
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.scheduleBtn}
              onPress={() => navigation.navigate('Workouts')}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle-outline" size={20} color={COLORS.bg} />
              <Text style={styles.scheduleBtnText}>Schedule new session</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: COLORS.bg },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn:       { width: 36, height: 36, borderRadius: RADIUS.full, backgroundColor: COLORS.surface2, alignItems: 'center', justifyContent: 'center' },
  headerTitle:   { fontFamily: FONTS.bold, fontSize: SIZES.lg, color: COLORS.textPrimary },
  settingsBtn:   { width: 36, height: 36, borderRadius: RADIUS.full, backgroundColor: COLORS.primary + '18', alignItems: 'center', justifyContent: 'center' },
  tabBar:        { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.surface },
  tabBtn:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: SPACING.md },
  tabBtnActive:  { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabLabel:      { fontFamily: FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.textMuted },
  tabLabelActive:{ color: COLORS.primary },
  scroll:        { paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg },
  sectionTitle:  { fontFamily: FONTS.bold, fontSize: SIZES.md, color: COLORS.textPrimary, marginBottom: SPACING.md, marginTop: SPACING.sm },
  card:          { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.base, marginBottom: SPACING.lg, ...SHADOWS.sm },
  // Streak
  streakCard:    { borderRadius: RADIUS.xl, padding: SPACING.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg, overflow: 'hidden' },
  streakNum:     { fontFamily: FONTS.black, fontSize: 52, color: COLORS.white, lineHeight: 56 },
  streakLabel:   { fontFamily: FONTS.bold, fontSize: SIZES.lg, color: COLORS.white, marginBottom: 4 },
  streakSub:     { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.white + 'BB' },
  // Rings
  ringsStack:    { gap: SPACING.md, marginBottom: SPACING.lg },
  ringCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  ringValue:     { fontFamily: FONTS.extraBold, fontSize: SIZES.xl, marginBottom: 2 },
  ringLabel:     { fontFamily: FONTS.medium, fontSize: SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  ringBarWrap:   { height: 4, backgroundColor: COLORS.surface3, borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  ringBar:       { height: 4, borderRadius: 2 },
  ringGoal:      { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textMuted },
  // Heatmap
  heatmapRow:    { flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.md },
  heatCell:      { alignItems: 'center', gap: 6 },
  heatDot:       { width: 32, height: 32, borderRadius: RADIUS.sm },
  heatDay:       { fontFamily: FONTS.semiBold, fontSize: SIZES.xs, color: COLORS.textMuted },
  heatLegend:    { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.textMuted, textAlign: 'center' },
  // Stats grid
  statsGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.lg },
  statBox:       { width: (CHART_W - SPACING.md) / 2, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.base, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statBoxValue:  { fontFamily: FONTS.extraBold, fontSize: SIZES.xl, color: COLORS.textPrimary, marginBottom: 2 },
  statBoxLabel:  { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.textMuted },
  // PRs
  prCard:        { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.base, alignItems: 'center', marginRight: SPACING.md, width: 110, borderWidth: 1, borderColor: COLORS.border },
  prValue:       { fontFamily: FONTS.bold, fontSize: SIZES.base, color: COLORS.primary, marginBottom: 2 },
  prLabel:       { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textMuted, textAlign: 'center' },
  // Charts
  adherenceDay:  { fontFamily: FONTS.semiBold, fontSize: SIZES.xs, color: COLORS.textSecondary },
  adherenceVal:  { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.textMuted },
  adherenceBarWrap:{ height: 6, backgroundColor: COLORS.surface3, borderRadius: 3, overflow: 'hidden' },
  adherenceBar:  { height: 6, borderRadius: 3 },
  // Bookings
  bookingSummary:{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  bookingSumCard:{ flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  bookingSumNum: { fontFamily: FONTS.extraBold, fontSize: SIZES.xl },
  bookingSumLabel:{ fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  bookingRow:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.md },
  bookingDot:    { width: 10, height: 10, borderRadius: 5 },
  bookingName:   { fontFamily: FONTS.semiBold, fontSize: SIZES.md, color: COLORS.textPrimary },
  bookingMeta:   { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  bookingBadge:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  bookingBadgeText:{ fontFamily: FONTS.semiBold, fontSize: SIZES.xs },
  bookingDivider:{ height: 1, backgroundColor: COLORS.border },
  scheduleBtn:   { backgroundColor: COLORS.primary, borderRadius: RADIUS.full, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, marginTop: SPACING.md },
  scheduleBtnText:{ fontFamily: FONTS.bold, fontSize: SIZES.base, color: COLORS.bg },
  emptyText:     { fontFamily: FONTS.bold, fontSize: SIZES.lg, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  emptySub:      { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textMuted, textAlign: 'center' },
});
