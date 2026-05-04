/**
 * WorkoutDetailScreen.js
 * Updated version — adds "Start Workout Now" button that launches
 * ActiveWorkoutScreen so users can independently begin workouts.
 */
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as services from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SIZES, SPACING, RADIUS } from '../../theme';
import { H2, H3, T, Caption, Card, Badge } from '../../components';

const LEVEL_VARIANT = { beginner: 'primary', intermediate: 'warning', advanced: 'danger' };
const TYPE_EMOJI    = { HIIT: '⚡', Cardio: '🏃', Strength: '💪', Yoga: '🧘', Flexibility: '🤸' };

export default function WorkoutDetailScreen({ route, navigation }) {
  const { workout } = route.params || {};
  const { user }    = useAuth();
  const [booking, setBooking] = useState(false);

  if (!workout) {
    return (
      <SafeAreaView style={styles.safe}>
        <T style={{ color: COLORS.textMuted, textAlign: 'center', marginTop: 40 }}>
          No workout selected
        </T>
      </SafeAreaView>
    );
  }

  // Estimate calories using MET
  const MET_VALUES = { HIIT: 8.0, Cardio: 7.0, Strength: 5.0, Yoga: 3.0, Flexibility: 2.5 };
  const MET        = MET_VALUES[workout.type] || 5.0;
  const weight     = user?.weight || 70;
  const estCalories = Math.round(MET * weight * (workout.duration / 60));

  const handleStartNow = async () => {
    // Get user weight from settings or profile for accurate calorie calc
    let userWeight = user?.weight || 70;
    try {
      const saved = await AsyncStorage.getItem('fitpro_settings');
      if (saved) {
        const s = JSON.parse(saved);
        if (s.useMetric === false && userWeight) userWeight = userWeight * 0.453592; // lbs to kg
      }
    } catch {}

    navigation.navigate('ActiveWorkout', { workout, userWeight });
  };

  const handleBook = async () => {
    setBooking(true);
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await services.createBooking({
        workoutPlanId: workout._id,
        sessionDate:   tomorrow.toISOString(),
        sessionTime:   '09:00 AM',
      });
      Toast.show({ type: 'success', text1: 'Session booked! 📅', text2: 'Check Stats → Bookings' });
      navigation.goBack();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Booking failed', text2: err.response?.data?.message || 'Please try again' });
    }
    setBooking(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Close button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
        <Ionicons name="close" size={22} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={[COLORS.primary + '33', COLORS.bg]} style={styles.hero}>
          <View style={styles.heroIcon}>
            <T style={{ fontSize: 40 }}>{TYPE_EMOJI[workout.type] || '💪'}</T>
          </View>
          <Badge label={workout.type} variant="primary" style={{ marginBottom: SPACING.sm }} />
          <H2 style={{ textAlign: 'center', marginBottom: SPACING.sm }}>{workout.name}</H2>
          <Caption style={{ textAlign: 'center', lineHeight: 20 }}>
            {workout.description || `${workout.type} workout — ${workout.goal}`}
          </Caption>
        </LinearGradient>

        <View style={styles.content}>
          {/* Meta row */}
          <Card style={styles.metaCard}>
            {[
              { icon: 'time-outline',      label: 'Duration',  val: `${workout.duration} min` },
              { icon: 'flame-outline',     label: 'Est. kcal', val: `~${estCalories}` },
              { icon: 'barbell-outline',   label: 'Exercises', val: workout.exercises?.length || '—' },
              { icon: 'trophy-outline',    label: 'Level',     val: workout.level },
            ].map((m, i) => (
              <View key={i} style={styles.metaItem}>
                <Ionicons name={m.icon} size={20} color={COLORS.primary} />
                <T style={styles.metaVal}>{m.val}</T>
                <Caption>{m.label}</Caption>
              </View>
            ))}
          </Card>

          {/* Goal & level */}
          <View style={styles.badgeRow}>
            <Badge label={workout.goal}  variant="info" />
            <Badge label={workout.level} variant={LEVEL_VARIANT[workout.level] || 'default'} />
            {workout.daysPerWeek && <Badge label={`${workout.daysPerWeek}×/week`} variant="muted" />}
          </View>

          {/* Exercises list */}
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
                        {ex.sets    ? `${ex.sets} sets × `  : ''}
                        {ex.reps    ? `${ex.reps} reps`     : ''}
                        {ex.duration? `${ex.duration}s`     : ''}
                        {ex.restSeconds ? ` · ${ex.restSeconds}s rest` : ''}
                      </Caption>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* Action buttons */}
          {/* PRIMARY — Start Now */}
          <TouchableOpacity
            onPress={handleStartNow}
            activeOpacity={0.85}
            style={{ marginBottom: SPACING.md }}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.startBtn}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Ionicons name="play-circle" size={22} color={COLORS.bg} />
              <T style={styles.startBtnText}>Start Workout Now</T>
            </LinearGradient>
          </TouchableOpacity>

          {/* SECONDARY — Book for later */}
          <TouchableOpacity
            onPress={handleBook}
            disabled={booking}
            activeOpacity={0.8}
            style={[styles.bookBtn, booking && { opacity: 0.6 }]}
          >
            <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
            <T style={styles.bookBtnText}>
              {booking ? 'Booking…' : 'Book for later'}
            </T>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.bg },
  closeBtn:  { position: 'absolute', top: 52, right: SPACING.xl, zIndex: 10, width: 38, height: 38, borderRadius: RADIUS.full, backgroundColor: COLORS.surface2, alignItems: 'center', justifyContent: 'center' },
  hero:      { alignItems: 'center', paddingTop: SPACING.xxxl, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.xl },
  heroIcon:  { width: 80, height: 80, borderRadius: RADIUS.xl, backgroundColor: COLORS.primary + '22', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  content:   { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxl },
  metaCard:  { flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.md },
  metaItem:  { alignItems: 'center', gap: 4 },
  metaVal:   { fontFamily: FONTS.bold, fontSize: SIZES.base, color: COLORS.textPrimary, marginTop: 4 },
  badgeRow:  { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xl, flexWrap: 'wrap' },
  section:   { marginBottom: SPACING.xl },
  exCard:    { marginBottom: SPACING.sm, padding: SPACING.md },
  exRow:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  exNum:     { width: 28, height: 28, borderRadius: RADIUS.full, backgroundColor: COLORS.primary + '22', alignItems: 'center', justifyContent: 'center' },
  startBtn:  { height: 56, borderRadius: RADIUS.full, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  startBtnText: { fontFamily: FONTS.bold, fontSize: SIZES.base, color: COLORS.bg },
  bookBtn:   { height: 52, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  bookBtnText:{ fontFamily: FONTS.semiBold, fontSize: SIZES.base, color: COLORS.primary },
});
