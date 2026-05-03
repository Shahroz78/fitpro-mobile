import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import * as services from '../../api/services';
import { COLORS, FONTS, SIZES, SPACING, RADIUS } from '../../theme';
import { H2, H3, T, Caption, Card, StatCard, SectionHeader, Badge } from '../../components';

const GREETING = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const MOCK_WORKOUT = {
  name: 'Morning HIIT Blast',
  type: 'HIIT',
  duration: 30,
  exercises: 8,
};

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats]   = useState(null);
  const [refresh, setRefresh] = useState(false);

  const load = async () => {
    try {
      const res = await services.getUserStats();
      setStats(res.data.stats);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => { setRefresh(true); await load(); setRefresh(false); };

  const firstName = user?.name?.split(' ')[0] || 'Athlete';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Caption>{GREETING()} 👋</Caption>
            <H2 style={{ marginTop: 2 }}>{firstName}</H2>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Today's plan card */}
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.planCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.planCardTop}>
            <View>
              <Caption style={{ color: COLORS.bg + 'BB' }}>Today's workout</Caption>
              <H3 style={{ color: COLORS.bg, marginTop: 4 }}>{MOCK_WORKOUT.name}</H3>
            </View>
            <View style={[styles.planTypeBadge]}>
              <T style={{ color: COLORS.primary, fontFamily: FONTS.bold, fontSize: SIZES.xs }}>{MOCK_WORKOUT.type}</T>
            </View>
          </View>
          <View style={styles.planMeta}>
            <View style={styles.planMetaItem}>
              <Ionicons name="time-outline" size={16} color={COLORS.bg + 'CC'} />
              <Caption style={{ color: COLORS.bg + 'CC', marginLeft: 4 }}>{MOCK_WORKOUT.duration} min</Caption>
            </View>
            <View style={styles.planMetaItem}>
              <Ionicons name="barbell-outline" size={16} color={COLORS.bg + 'CC'} />
              <Caption style={{ color: COLORS.bg + 'CC', marginLeft: 4 }}>{MOCK_WORKOUT.exercises} exercises</Caption>
            </View>
          </View>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => navigation.navigate('WorkoutDetail', { workout: MOCK_WORKOUT })}
            activeOpacity={0.85}
          >
            <T style={{ fontFamily: FONTS.bold, color: COLORS.primary, fontSize: SIZES.sm }}>Start Workout →</T>
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats */}
        <SectionHeader title="Your stats" />
        <View style={styles.statsRow}>
          <StatCard label="Activities" value={stats?.totalActivities ?? '—'} icon="🏃" color={COLORS.primary} />
          <StatCard label="Calories"   value={stats?.totalCalories ? `${Math.round(stats.totalCalories / 1000)}k` : '—'} icon="🔥" color={COLORS.secondary} style={{ marginHorizontal: SPACING.sm }} />
          <StatCard label="Bookings"   value={stats?.upcomingBookings ?? '—'} icon="📅" color={COLORS.info} />
        </View>

        {/* Quick actions */}
        <SectionHeader title="Quick actions" />
        <View style={styles.quickRow}>
          {[
            { icon: 'barbell-outline', label: 'Browse\nWorkouts', screen: 'Workouts' },
            { icon: 'add-circle-outline', label: 'Log\nActivity',  screen: 'Log'      },
            { icon: 'trending-up-outline', label: 'View\nProgress', screen: 'Progress' },
          ].map((a, i) => (
            <TouchableOpacity
              key={i}
              style={styles.quickItem}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(a.screen)}
            >
              <View style={styles.quickIcon}>
                <Ionicons name={a.icon} size={24} color={COLORS.primary} />
              </View>
              <T style={styles.quickLabel}>{a.label}</T>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tips */}
        <SectionHeader title="Daily tip" />
        <Card style={{ marginBottom: SPACING.xxxl }}>
          <View style={{ flexDirection: 'row', gap: SPACING.md, alignItems: 'flex-start' }}>
            <T style={{ fontSize: 28 }}>💡</T>
            <T style={{ flex: 1, color: COLORS.textSecondary, lineHeight: 22, fontSize: SIZES.md }}>
              Hydrate before your workout. Drinking 500ml of water 30 minutes before exercise improves performance by up to 20%.
            </T>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingTop: SPACING.base, marginBottom: SPACING.lg },
  notifBtn: { position: 'relative', width: 42, height: 42, borderRadius: RADIUS.full, backgroundColor: COLORS.surface2, alignItems: 'center', justifyContent: 'center' },
  notifDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.secondary },
  planCard: { marginHorizontal: SPACING.xl, borderRadius: RADIUS.xl, padding: SPACING.xl, marginBottom: SPACING.lg },
  planCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.base },
  planTypeBadge: { backgroundColor: COLORS.bg + 'CC', paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  planMeta: { flexDirection: 'row', gap: SPACING.lg, marginBottom: SPACING.lg },
  planMetaItem: { flexDirection: 'row', alignItems: 'center' },
  startBtn: { backgroundColor: COLORS.bg + 'CC', borderRadius: RADIUS.full, paddingVertical: 10, paddingHorizontal: SPACING.lg, alignSelf: 'flex-start' },
  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.xl, marginBottom: SPACING.sm },
  quickRow: { flexDirection: 'row', paddingHorizontal: SPACING.xl, gap: SPACING.md, marginBottom: SPACING.sm },
  quickItem: { flex: 1, alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.border },
  quickIcon: { width: 48, height: 48, borderRadius: RADIUS.md, backgroundColor: COLORS.primary + '18', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  quickLabel: { fontFamily: FONTS.semiBold, fontSize: SIZES.xs, color: COLORS.textSecondary, textAlign: 'center' },
});
