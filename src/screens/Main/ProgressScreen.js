import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import * as services from '../../api/services';
import { COLORS, FONTS, SIZES, SPACING, RADIUS } from '../../theme';
import { H2, H3, T, Caption, Card, StatCard, SectionHeader } from '../../components';

const { width } = Dimensions.get('window');

const chartConfig = {
  backgroundGradientFrom: COLORS.surface,
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: COLORS.surface,
  backgroundGradientToOpacity: 0,
  color: (opacity = 1) => `rgba(0, 229, 160, ${opacity})`,
  labelColor: () => COLORS.textMuted,
  strokeWidth: 2.5,
  propsForDots: { r: '4', strokeWidth: '2', stroke: COLORS.primary },
  propsForBackgroundLines: { strokeDasharray: '4', stroke: COLORS.border, strokeWidth: 0.8 },
};

const MOCK_CHART = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [{ data: [0, 1, 2, 1, 3, 2, 1] }],
};
const MOCK_CAL = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [{ data: [0, 280, 450, 320, 520, 380, 210] }],
};

export default function ProgressScreen() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await services.getProgress(30);
        setData(res.data);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <H2 style={{ marginBottom: SPACING.xs }}>Progress</H2>
        <Caption style={{ marginBottom: SPACING.xl }}>Your last 30 days</Caption>

        {/* Summary stats */}
        <View style={styles.statsRow}>
          <StatCard label="Workouts" value={data?.daily?.length || 12} icon="🏋️" color={COLORS.primary} />
          <StatCard label="Avg Kcal" value="320"  icon="🔥" color={COLORS.secondary} style={{ marginHorizontal: SPACING.sm }} />
          <StatCard label="Streak"   value="5🔥"  icon="⚡" color={COLORS.warning} />
        </View>

        {/* Sessions chart */}
        <SectionHeader title="Sessions per day" />
        <Card style={{ padding: 0, overflow: 'hidden', marginBottom: SPACING.xl }}>
          <LineChart
            data={MOCK_CHART}
            width={width - SPACING.xl * 2}
            height={180}
            chartConfig={chartConfig}
            bezier
            withInnerLines
            withOuterLines={false}
            fromZero
            style={{ borderRadius: RADIUS.lg }}
          />
        </Card>

        {/* Calories chart */}
        <SectionHeader title="Calories burned" />
        <Card style={{ padding: 0, overflow: 'hidden', marginBottom: SPACING.xl }}>
          <LineChart
            data={MOCK_CAL}
            width={width - SPACING.xl * 2}
            height={180}
            chartConfig={{ ...chartConfig, color: (o = 1) => `rgba(255, 107, 53, ${o})`, propsForDots: { r: '4', strokeWidth: '2', stroke: COLORS.secondary } }}
            bezier
            withInnerLines
            withOuterLines={false}
            fromZero
            style={{ borderRadius: RADIUS.lg }}
          />
        </Card>

        {/* Achievements */}
        <SectionHeader title="Achievements" />
        <View style={styles.achievements}>
          {[
            { emoji: '🏃', title: 'First Run',       desc: 'Completed your first run session' },
            { emoji: '🔥', title: '5 Day Streak',    desc: 'Trained 5 days in a row' },
            { emoji: '💪', title: '10 Workouts',     desc: 'Logged 10 workout sessions' },
            { emoji: '⚡', title: 'HIIT Master',      desc: 'Completed 5 HIIT sessions' },
          ].map((a, i) => (
            <Card key={i} style={styles.achievement}>
              <T style={{ fontSize: 28, marginBottom: SPACING.xs }}>{a.emoji}</T>
              <T style={{ fontFamily: FONTS.bold, fontSize: SIZES.sm, marginBottom: 2 }}>{a.title}</T>
              <Caption style={{ textAlign: 'center', lineHeight: 16 }}>{a.desc}</Caption>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.base, paddingBottom: SPACING.xxxl },
  statsRow: { flexDirection: 'row', marginBottom: SPACING.sm },
  achievements: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.xxxl },
  achievement: { width: '47%', alignItems: 'center', padding: SPACING.base },
});
