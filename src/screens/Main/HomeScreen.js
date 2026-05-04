/**
 * HomeScreen.js — Updated with Stats & Settings shortcuts,
 * live calorie goal ring, and direct Start Workout access.
 */
import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import * as services from '../../api/services';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../../theme';
import { H2, H3, T, Caption, Card, StatCard, SectionHeader } from '../../components';

const { width } = Dimensions.get('window');

const GREETING = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

// Calorie ring component
function CalorieRing({ burned, goal }) {
  const pct = Math.min(1, burned / (goal || 2000));
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: 72, height: 72, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ position: 'absolute', width: 72, height: 72, borderRadius: 36, borderWidth: 6, borderColor: COLORS.surface3 }} />
        <View style={{ position: 'absolute', width: 72, height: 72, borderRadius: 36, borderWidth: 6, borderColor: 'transparent', borderTopColor: COLORS.secondary, transform: [{ rotate: `${pct * 360 - 90}deg` }] }} />
        <T style={{ fontSize: 22 }}>🔥</T>
      </View>
      <T style={{ fontFamily: FONTS.bold, fontSize: SIZES.sm, color: COLORS.secondary, marginTop: 4 }}>{burned}</T>
      <Caption>/ {goal} kcal</Caption>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { user }        = useAuth();
  const [stats,    setStats]    = useState(null);
  const [settings, setSettings] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [refresh,  setRefresh]  = useState(false);
  const [todayActivity, setTodayActivity] = useState(null);

  const load = async () => {
    try {
      const [statsRes, wRes, settingsRaw, progressRes] = await Promise.all([
        services.getUserStats(),
        services.getWorkouts({ limit: 3 }),
        AsyncStorage.getItem('fitpro_settings'),
        services.getProgress(1),
      ]);
      setStats(statsRes.data.stats);
      setWorkouts(wRes.data.workouts || []);
      if (settingsRaw) setSettings(JSON.parse(settingsRaw));
      const todayArr = progressRes.data.daily || [];
      if (todayArr.length) setTodayActivity(todayArr[todayArr.length - 1]);
    } catch {}
  };

  useEffect(() => { load(); }, []);
  const onRefresh = async () => { setRefresh(true); await load(); setRefresh(false); };

  const firstName   = user?.name?.split(' ')[0] || 'Athlete';
  const calorieGoal = settings?.calorieGoal || 2000;
  const todayCal    = todayActivity?.totalCalories || 0;
  const stepGoal    = settings?.stepGoal || 10000;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Caption>{GREETING()} 👋</Caption>
            <H2 style={{ marginTop: 2 }}>{firstName}</H2>
          </View>
          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('FitnessSettings')}
            >
              <Ionicons name="settings-outline" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { position: 'relative' }]}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.textPrimary} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Today summary card ── */}
        <View style={styles.todayCard}>
          <LinearGradient
            colors={['#162530', '#1E3040']}
            style={styles.todayGrad}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <View style={{ flex: 1 }}>
              <Caption style={{ color: COLORS.textMuted }}>Today's summary</Caption>
              <View style={styles.todayStats}>
                <View style={styles.todayStatItem}>
                  <T style={styles.todayStatVal}>{todayActivity?.count || 0}</T>
                  <Caption>Sessions</Caption>
                </View>
                <View style={styles.todayDivider} />
                <View style={styles.todayStatItem}>
                  <T style={styles.todayStatVal}>{todayActivity?.totalMinutes || 0}</T>
                  <Caption>Minutes</Caption>
                </View>
                <View style={styles.todayDivider} />
                <View style={styles.todayStatItem}>
                  <T style={[styles.todayStatVal, { color: COLORS.primary }]}>
                    {user?.fitnessLevel || 'beginner'}
                  </T>
                  <Caption>Level</Caption>
                </View>
              </View>
            </View>
            <CalorieRing burned={todayCal} goal={calorieGoal} />
          </LinearGradient>
        </View>

        {/* ── Quick actions ── */}
        <View style={styles.quickRow}>
          {[
            { icon: 'play-circle',    label: 'Start\nWorkout', color: COLORS.primary,   action: () => navigation.navigate('Workouts') },
            { icon: 'stats-chart',    label: 'View\nStats',    color: COLORS.secondary,  action: () => navigation.navigate('Stats') },
            { icon: 'add-circle',     label: 'Log\nActivity',  color: COLORS.info,        action: () => navigation.navigate('Log') },
            { icon: 'settings',       label: 'My\nGoals',      color: COLORS.warning,     action: () => navigation.navigate('FitnessSettings') },
          ].map((a, i) => (
            <TouchableOpacity
              key={i}
              style={styles.quickItem}
              onPress={a.action}
              activeOpacity={0.8}
            >
              <View style={[styles.quickIcon, { backgroundColor: a.color + '22' }]}>
                <Ionicons name={a.icon} size={22} color={a.color} />
              </View>
              <T style={styles.quickLabel}>{a.label}</T>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Goal progress bars ── */}
        <SectionHeader
          title="Today's goals"
          onSeeAll={() => navigation.navigate('Stats')}
        />
        <Card style={{ marginHorizontal: SPACING.xl, marginBottom: SPACING.sm, gap: SPACING.md }}>
          {[
            { label: 'Calories', current: todayCal, goal: calorieGoal, unit: 'kcal', color: COLORS.secondary, icon: '🔥' },
            { label: 'Steps',    current: 7832,      goal: stepGoal,    unit: 'steps', color: COLORS.primary,   icon: '👟' },
            { label: 'Water',    current: 5,         goal: settings?.waterGoal || 8, unit: 'glasses', color: COLORS.info, icon: '💧' },
          ].map((g, i) => {
            const pct = Math.min(1, g.current / (g.goal || 1));
            return (
              <View key={i}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <T style={{ fontFamily: FONTS.semiBold, fontSize: SIZES.sm }}>
                    {g.icon} {g.label}
                  </T>
                  <Caption>{g.current.toLocaleString()} / {g.goal.toLocaleString()} {g.unit}</Caption>
                </View>
                <View style={styles.goalBarWrap}>
                  <View style={[styles.goalBar, { width: `${pct * 100}%`, backgroundColor: g.color }]} />
                </View>
              </View>
            );
          })}
        </Card>

        {/* ── Recommended workouts ── */}
        <SectionHeader
          title="Recommended for you"
          onSeeAll={() => navigation.navigate('Workouts')}
        />
        {workouts.map((w, i) => (
          <TouchableOpacity
            key={w._id || i}
            style={styles.workoutCard}
            onPress={() => navigation.navigate('WorkoutDetail', { workout: w })}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[COLORS.surface, COLORS.surface2]}
              style={styles.workoutCardGrad}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <View style={[styles.workoutTypeTag, { backgroundColor: COLORS.primary + '22' }]}>
                <T style={{ fontSize: 20 }}>
                  {{ HIIT:'⚡', Cardio:'🏃', Strength:'💪', Yoga:'🧘' }[w.type] || '🏋️'}
                </T>
              </View>
              <View style={{ flex: 1, marginLeft: SPACING.md }}>
                <T style={{ fontFamily: FONTS.semiBold, fontSize: SIZES.md, marginBottom: 2 }}>{w.name}</T>
                <Caption>{w.type} · {w.duration} min · {w.level}</Caption>
              </View>
              <TouchableOpacity
                style={styles.playBtn}
                onPress={() => navigation.navigate('ActiveWorkout', { workout: w })}
                activeOpacity={0.8}
              >
                <Ionicons name="play" size={16} color={COLORS.bg} />
              </TouchableOpacity>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        {/* ── Stats summary row ── */}
        <SectionHeader
          title="Overall stats"
          onSeeAll={() => navigation.navigate('Stats')}
        />
        <View style={styles.statsRow}>
          <StatCard label="Activities" value={stats?.totalActivities ?? 0}  icon="🏃" color={COLORS.primary} />
          <StatCard label="Calories"
            value={stats?.totalCalories ? `${Math.round(stats.totalCalories / 1000)}k` : '0'}
            icon="🔥" color={COLORS.secondary}
            style={{ marginHorizontal: SPACING.sm }}
          />
          <StatCard label="Bookings" value={stats?.upcomingBookings ?? 0} icon="📅" color={COLORS.info} />
        </View>

        {/* ── Daily tip ── */}
        <SectionHeader title="Daily tip" />
        <Card style={{ marginHorizontal: SPACING.xl, marginBottom: SPACING.xxxl }}>
          <View style={{ flexDirection: 'row', gap: SPACING.md, alignItems: 'flex-start' }}>
            <T style={{ fontSize: 28 }}>💡</T>
            <T style={{ flex: 1, color: COLORS.textSecondary, lineHeight: 22, fontSize: SIZES.md }}>
              Consistency beats intensity. Showing up for a 20-minute workout every day builds more lasting fitness than occasional 2-hour sessions.
            </T>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.bg },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingTop: SPACING.base, marginBottom: SPACING.lg },
  iconBtn:      { width: 40, height: 40, borderRadius: RADIUS.full, backgroundColor: COLORS.surface2, alignItems: 'center', justifyContent: 'center' },
  notifDot:     { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.secondary },
  todayCard:    { marginHorizontal: SPACING.xl, borderRadius: RADIUS.xl, overflow: 'hidden', marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  todayGrad:    { flexDirection: 'row', alignItems: 'center', padding: SPACING.xl, gap: SPACING.xl },
  todayStats:   { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.md },
  todayStatItem:{ alignItems: 'center', paddingHorizontal: SPACING.md },
  todayStatVal: { fontFamily: FONTS.extraBold, fontSize: SIZES.xl, color: COLORS.textPrimary },
  todayDivider: { width: 1, height: 32, backgroundColor: COLORS.border },
  quickRow:     { flexDirection: 'row', paddingHorizontal: SPACING.xl, gap: SPACING.sm, marginBottom: SPACING.lg },
  quickItem:    { flex: 1, alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  quickIcon:    { width: 44, height: 44, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  quickLabel:   { fontFamily: FONTS.semiBold, fontSize: SIZES.xs, color: COLORS.textSecondary, textAlign: 'center' },
  goalBarWrap:  { height: 6, backgroundColor: COLORS.surface3, borderRadius: 3, overflow: 'hidden' },
  goalBar:      { height: 6, borderRadius: 3 },
  workoutCard:  { marginHorizontal: SPACING.xl, marginBottom: SPACING.sm, borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  workoutCardGrad:{ flexDirection: 'row', alignItems: 'center', padding: SPACING.md },
  workoutTypeTag: { width: 44, height: 44, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  playBtn:      { width: 36, height: 36, borderRadius: RADIUS.full, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  statsRow:     { flexDirection: 'row', paddingHorizontal: SPACING.xl, marginBottom: SPACING.sm },
});
