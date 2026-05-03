import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import * as services from '../../api/services';
import { COLORS, FONTS, SIZES, SPACING, RADIUS } from '../../theme';
import { H2, H3, T, Caption, Card, Badge, GradientButton } from '../../components';

const LEVEL_VARIANT = { beginner: 'primary', intermediate: 'warning', advanced: 'danger' };

export default function WorkoutDetailScreen({ route, navigation }) {
  const { workout } = route.params || {};
  const [booking, setBooking] = useState(false);

  if (!workout) {
    return (
      <SafeAreaView style={styles.safe}>
        <T>No workout selected</T>
      </SafeAreaView>
    );
  }

  const handleBook = async () => {
    setBooking(true);
    try {
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
      await services.createBooking({
        workoutPlanId: workout._id,
        sessionDate: tomorrow.toISOString(),
        sessionTime: '09:00 AM',
      });
      Toast.show({ type: 'success', text1: 'Session booked! 📅', text2: 'Check your bookings tab' });
      navigation.goBack();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Booking failed', text2: err.response?.data?.message || 'Please try again' });
    }
    setBooking(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Back button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="close" size={22} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={[COLORS.primary + '33', COLORS.bg]} style={styles.hero}>
          <View style={styles.heroIcon}>
            <T style={{ fontSize: 40 }}>💪</T>
          </View>
          <Badge label={workout.type} variant="primary" style={{ marginBottom: SPACING.sm }} />
          <H2 style={{ textAlign: 'center', marginBottom: SPACING.sm }}>{workout.name}</H2>
          <Caption style={{ textAlign: 'center', lineHeight: 20 }}>
            {workout.description || `${workout.type} workout targeting ${workout.goal}`}
          </Caption>
        </LinearGradient>

        <View style={styles.content}>
          {/* Meta row */}
          <Card style={styles.metaCard}>
            {[
              { icon: 'time-outline',     label: 'Duration',    val: `${workout.duration} min` },
              { icon: 'barbell-outline',  label: 'Exercises',   val: workout.exercises?.length || '—' },
              { icon: 'calendar-outline', label: 'Per week',    val: `${workout.daysPerWeek}×` },
              { icon: 'trophy-outline',   label: 'Level',       val: workout.level },
            ].map((m, i) => (
              <View key={i} style={styles.metaItem}>
                <Ionicons name={m.icon} size={20} color={COLORS.primary} />
                <T style={styles.metaVal}>{m.val}</T>
                <Caption>{m.label}</Caption>
              </View>
            ))}
          </Card>

          {/* Goal */}
          <View style={styles.section}>
            <H3 style={{ marginBottom: SPACING.sm }}>Goal</H3>
            <Badge label={workout.goal} variant="info" />
          </View>

          {/* Exercises */}
          {workout.exercises?.length > 0 && (
            <View style={styles.section}>
              <H3 style={{ marginBottom: SPACING.md }}>Exercises</H3>
              {workout.exercises.map((ex, i) => (
                <Card key={i} style={styles.exCard}>
                  <View style={styles.exRow}>
                    <View style={styles.exNum}>
                      <T style={{ fontFamily: FONTS.bold, fontSize: SIZES.sm, color: COLORS.primary }}>{i + 1}</T>
                    </View>
                    <View style={{ flex: 1 }}>
                      <T style={{ fontFamily: FONTS.semiBold }}>{ex.name}</T>
                      <Caption style={{ marginTop: 2 }}>
                        {ex.sets ? `${ex.sets} sets × ` : ''}
                        {ex.reps ? `${ex.reps} reps` : ''}
                        {ex.duration ? `${ex.duration}s` : ''}
                        {ex.restSeconds ? ` · ${ex.restSeconds}s rest` : ''}
                      </Caption>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}

          <GradientButton title="📅 Book This Session" onPress={handleBook} loading={booking} style={{ marginBottom: SPACING.xxxl }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  back: { position: 'absolute', top: 52, right: SPACING.xl, zIndex: 10, width: 38, height: 38, borderRadius: RADIUS.full, backgroundColor: COLORS.surface2, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', paddingTop: SPACING.xl, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.xl },
  heroIcon: { width: 80, height: 80, borderRadius: RADIUS.xl, backgroundColor: COLORS.primary + '22', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  content: { paddingHorizontal: SPACING.xl },
  metaCard: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.lg },
  metaItem: { alignItems: 'center', gap: 4 },
  metaVal: { fontFamily: FONTS.bold, fontSize: SIZES.base, color: COLORS.textPrimary, marginTop: 4 },
  section: { marginBottom: SPACING.xl },
  exCard: { marginBottom: SPACING.sm, padding: SPACING.md },
  exRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  exNum: { width: 28, height: 28, borderRadius: RADIUS.full, backgroundColor: COLORS.primary + '22', alignItems: 'center', justifyContent: 'center' },
});
