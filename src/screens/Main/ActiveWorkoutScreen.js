/**
 * ActiveWorkoutScreen.js
 * Users can independently start, track, and complete workouts.
 * Features: exercise timer, set/rep tracker, rest timer, calorie counter, completion summary.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Vibration, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import * as services from '../../api/services';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../../theme';

const { width } = Dimensions.get('window');

// MET values per workout type for calorie calculation
// Calories = MET × weight(kg) × time(hours)
const MET_VALUES = {
  HIIT: 8.0, Cardio: 7.0, Strength: 5.0,
  Yoga: 3.0, Flexibility: 2.5, Custom: 5.0,
};

/* ── Circular Progress Ring ───────────────────────── */
function CircleTimer({ progress, size = 200, color = COLORS.primary, children }) {
  const radius      = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDash  = circumference * (1 - progress);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background ring */}
      <View style={{
        position: 'absolute', width: size, height: size,
        borderRadius: size / 2, borderWidth: 8,
        borderColor: COLORS.surface3,
      }} />
      {/* Progress ring using border trick */}
      <View style={{
        position: 'absolute', width: size, height: size,
        borderRadius: size / 2, borderWidth: 8,
        borderColor: 'transparent',
        borderTopColor: color,
        transform: [{ rotate: `${progress * 360 - 90}deg` }],
      }} />
      <View style={{
        position: 'absolute', width: size - 32, height: size - 32,
        borderRadius: (size - 32) / 2,
        backgroundColor: COLORS.surface,
        alignItems: 'center', justifyContent: 'center',
        ...SHADOWS.sm,
      }}>
        {children}
      </View>
    </View>
  );
}

/* ── Exercise Card ────────────────────────────────── */
function ExerciseCard({ exercise, index, isActive, isCompleted, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.exCard,
        isActive    && styles.exCardActive,
        isCompleted && styles.exCardDone,
      ]}
    >
      <View style={[styles.exNum, isCompleted && { backgroundColor: COLORS.primary }]}>
        {isCompleted
          ? <Ionicons name="checkmark" size={14} color={COLORS.bg} />
          : <Text style={[styles.exNumText, isActive && { color: COLORS.primary }]}>{index + 1}</Text>
        }
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.exName, isActive && { color: COLORS.primary }]}>{exercise.name}</Text>
        <Text style={styles.exMeta}>
          {exercise.sets ? `${exercise.sets} sets` : ''}
          {exercise.sets && exercise.reps ? ' × ' : ''}
          {exercise.reps ? `${exercise.reps} reps` : ''}
          {exercise.duration ? `${exercise.duration}s` : ''}
          {exercise.restSeconds ? `  ·  ${exercise.restSeconds}s rest` : ''}
        </Text>
      </View>
      {isActive && (
        <View style={styles.activeIndicator}>
          <Text style={{ fontSize: 8, color: COLORS.primary }}>▶</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

/* ── Main Screen ──────────────────────────────────── */
export default function ActiveWorkoutScreen({ route, navigation }) {
  const { workout, userWeight = 70 } = route.params || {};
  const exercises = workout?.exercises || [];

  // State
  const [phase, setPhase]             = useState('ready'); // ready | exercise | rest | completed
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [currentSet, setCurrentSet]   = useState(1);
  const [completedSets, setCompletedSets] = useState({});
  const [timer, setTimer]             = useState(0);
  const [restTimer, setRestTimer]     = useState(0);
  const [totalTime, setTotalTime]     = useState(0);
  const [calories, setCalories]       = useState(0);
  const [isRunning, setIsRunning]     = useState(false);
  const [isPaused, setIsPaused]       = useState(false);

  const intervalRef  = useRef(null);
  const totalRef     = useRef(null);
  const pulseAnim    = useRef(new Animated.Value(1)).current;
  const fadeAnim     = useRef(new Animated.Value(0)).current;

  const MET        = MET_VALUES[workout?.type] || 5.0;
  const currentEx  = exercises[currentIdx];
  const totalSets  = currentEx?.sets || 1;
  const restTime   = currentEx?.restSeconds || 60;

  // Fade in on mount
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  // Pulse animation when exercise timer running
  useEffect(() => {
    if (isRunning && phase === 'exercise') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRunning, phase]);

  // Total time counter
  useEffect(() => {
    if (isRunning && !isPaused) {
      totalRef.current = setInterval(() => {
        setTotalTime(t => {
          const newT = t + 1;
          // Recalculate calories every second
          const hours = newT / 3600;
          setCalories(Math.round(MET * userWeight * hours));
          return newT;
        });
      }, 1000);
    }
    return () => clearInterval(totalRef.current);
  }, [isRunning, isPaused]);

  // Exercise timer (for duration-based exercises)
  useEffect(() => {
    if (phase === 'exercise' && isRunning && !isPaused && currentEx?.duration) {
      setTimer(currentEx.duration);
      intervalRef.current = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            handleSetDone();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [phase, currentIdx, currentSet, isRunning, isPaused]);

  // Rest timer
  useEffect(() => {
    if (phase === 'rest') {
      setRestTimer(restTime);
      const id = setInterval(() => {
        setRestTimer(t => {
          if (t <= 1) {
            clearInterval(id);
            Vibration.vibrate([0, 300, 100, 300]);
            moveToNextSet();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(id);
    }
  }, [phase]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const startWorkout = () => {
    setPhase('exercise');
    setIsRunning(true);
    Vibration.vibrate(100);
  };

  const togglePause = () => {
    setIsPaused(p => !p);
    if (!isPaused) {
      clearInterval(intervalRef.current);
      clearInterval(totalRef.current);
    }
  };

  const handleSetDone = useCallback(() => {
    Vibration.vibrate([0, 200, 100, 200]);
    const key = `${currentIdx}-${currentSet}`;
    setCompletedSets(prev => ({ ...prev, [key]: true }));

    const isLastSet = currentSet >= totalSets;
    if (isLastSet) {
      const isLastEx = currentIdx >= exercises.length - 1;
      if (isLastEx) {
        finishWorkout();
      } else {
        // Rest before next exercise
        setPhase('rest');
      }
    } else {
      // Rest between sets
      setPhase('rest');
    }
  }, [currentIdx, currentSet, totalSets, exercises.length]);

  const moveToNextSet = useCallback(() => {
    const isLastSet = currentSet >= totalSets;
    if (isLastSet) {
      setCurrentIdx(i => i + 1);
      setCurrentSet(1);
    } else {
      setCurrentSet(s => s + 1);
    }
    setPhase('exercise');
    Toast.show({ type: 'success', text1: `Set done! 💪`, text2: 'Keep going!' });
  }, [currentSet, totalSets]);

  const skipRest = () => {
    clearInterval(intervalRef.current);
    moveToNextSet();
  };

  const finishWorkout = async () => {
    setIsRunning(false);
    setPhase('completed');
    Vibration.vibrate([0, 500, 200, 500, 200, 500]);

    // Log activity to backend
    try {
      await services.logActivity({
        type:     'workout',
        duration: Math.round(totalTime / 60),
        calories,
        workoutName: workout?.name,
        source:   'app',
        date:     new Date().toISOString(),
      });
    } catch {}
  };

  const quitWorkout = () => {
    Alert.alert(
      'Quit workout?',
      'Your progress will be lost.',
      [
        { text: 'Keep going', style: 'cancel' },
        {
          text: 'Quit', style: 'destructive',
          onPress: () => {
            setIsRunning(false);
            navigation.goBack();
          },
        },
      ]
    );
  };

  // ── COMPLETED SCREEN ───────────────────────────────
  if (phase === 'completed') {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <LinearGradient colors={['#0F2027', COLORS.primary + '33', '#0F2027']} style={StyleSheet.absoluteFillObject} />
        <SafeAreaView style={styles.completedSafe}>
          <Animated.View style={[styles.completedContent, { opacity: fadeAnim }]}>
            <Text style={styles.completedEmoji}>🏆</Text>
            <Text style={styles.completedTitle}>Workout{'\n'}Complete!</Text>
            <Text style={styles.completedSub}>Amazing work. You crushed it!</Text>

            <View style={styles.summaryGrid}>
              {[
                { label: 'Duration',   value: formatTime(totalTime), icon: '⏱️' },
                { label: 'Calories',   value: `${calories} kcal`,    icon: '🔥' },
                { label: 'Exercises',  value: exercises.length,       icon: '💪' },
                { label: 'Sets done',  value: Object.keys(completedSets).length, icon: '✅' },
              ].map((s, i) => (
                <View key={i} style={styles.summaryCard}>
                  <Text style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</Text>
                  <Text style={styles.summaryValue}>{s.value}</Text>
                  <Text style={styles.summaryLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => navigation.navigate('Main')}
              activeOpacity={0.85}
            >
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.doneBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.doneBtnText}>Back to Home</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </View>
    );
  }

  // ── READY SCREEN ───────────────────────────────────
  if (phase === 'ready') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <LinearGradient colors={['#0F2027', '#162530']} style={StyleSheet.absoluteFillObject} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={styles.workoutTitle}>{workout?.name}</Text>
            <Text style={styles.workoutMeta}>{workout?.type} · {workout?.duration} min · {exercises.length} exercises</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.readyScroll} showsVerticalScrollIndicator={false}>
          {/* Preview info */}
          <View style={styles.previewRow}>
            {[
              { icon: '🔥', label: `~${Math.round(MET * userWeight * (workout?.duration || 30) / 60)} kcal` },
              { icon: '💪', label: `${exercises.length} exercises` },
              { icon: '📅', label: workout?.level || 'intermediate' },
            ].map((p, i) => (
              <View key={i} style={styles.previewItem}>
                <Text style={{ fontSize: 22 }}>{p.icon}</Text>
                <Text style={styles.previewLabel}>{p.label}</Text>
              </View>
            ))}
          </View>

          {/* Exercise list preview */}
          <Text style={styles.sectionTitle}>Exercises</Text>
          {exercises.map((ex, i) => (
            <ExerciseCard
              key={i} exercise={ex} index={i}
              isActive={false} isCompleted={false}
            />
          ))}

          <TouchableOpacity onPress={startWorkout} activeOpacity={0.85} style={{ marginTop: SPACING.xl }}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.startBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="play" size={22} color={COLORS.bg} />
              <Text style={styles.startBtnText}>Start Workout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── REST SCREEN ────────────────────────────────────
  if (phase === 'rest') {
    const progress = restTimer / restTime;
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <LinearGradient colors={['#0F2027', '#162530']} style={StyleSheet.absoluteFillObject} />
        <View style={styles.restContent}>
          <Text style={styles.restLabel}>Rest time</Text>
          <CircleTimer progress={progress} size={220} color={COLORS.info}>
            <Text style={styles.restTimerText}>{formatTime(restTimer)}</Text>
            <Text style={styles.restTimerSub}>seconds left</Text>
          </CircleTimer>
          <Text style={styles.restNextLabel}>Next up</Text>
          <Text style={styles.restNextEx}>
            {currentSet < totalSets
              ? `Set ${currentSet + 1} of ${totalSets} — ${currentEx?.name}`
              : exercises[currentIdx + 1]?.name || 'Last exercise!'
            }
          </Text>
          <TouchableOpacity onPress={skipRest} style={styles.skipBtn} activeOpacity={0.8}>
            <Text style={styles.skipBtnText}>Skip rest →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── ACTIVE EXERCISE SCREEN ─────────────────────────
  const exProgress = currentEx?.duration
    ? (currentEx.duration - timer) / currentEx.duration
    : currentSet / totalSets;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient colors={['#0F2027', '#162530']} style={StyleSheet.absoluteFillObject} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={quitWorkout} style={styles.quitBtn}>
          <Ionicons name="close" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
        <View style={styles.topStats}>
          <Text style={styles.topStat}>⏱ {formatTime(totalTime)}</Text>
          <Text style={styles.topStat}>🔥 {calories} kcal</Text>
        </View>
        <TouchableOpacity onPress={togglePause} style={styles.pauseBtn}>
          <Ionicons name={isPaused ? 'play' : 'pause'} size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarWrap}>
        <View style={[styles.progressBar, { width: `${((currentIdx) / exercises.length) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.activeScroll} showsVerticalScrollIndicator={false}>
        {/* Exercise counter */}
        <Text style={styles.exCounter}>Exercise {currentIdx + 1} of {exercises.length}</Text>

        {/* Timer ring */}
        <View style={{ alignItems: 'center', marginVertical: SPACING.xl }}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <CircleTimer progress={exProgress} size={220} color={COLORS.primary}>
              {currentEx?.duration ? (
                <>
                  <Text style={styles.timerText}>{formatTime(timer)}</Text>
                  <Text style={styles.timerSub}>remaining</Text>
                </>
              ) : (
                <>
                  <Text style={styles.setDisplay}>{currentSet}/{totalSets}</Text>
                  <Text style={styles.timerSub}>sets</Text>
                </>
              )}
            </CircleTimer>
          </Animated.View>
        </View>

        {/* Current exercise name */}
        <Text style={styles.currentExName}>{currentEx?.name}</Text>
        <Text style={styles.currentExDetail}>
          {currentEx?.reps ? `${currentEx.reps} reps` : ''}
          {currentEx?.duration ? `${currentEx.duration} seconds` : ''}
          {currentEx?.restSeconds ? `  ·  ${currentEx.restSeconds}s rest` : ''}
        </Text>

        {/* Set tracker (for rep-based) */}
        {!currentEx?.duration && (
          <View style={styles.setRow}>
            {Array.from({ length: totalSets }).map((_, i) => {
              const done = completedSets[`${currentIdx}-${i + 1}`];
              const active = i + 1 === currentSet;
              return (
                <View key={i} style={[styles.setDot, active && styles.setDotActive, done && styles.setDotDone]}>
                  {done && <Ionicons name="checkmark" size={12} color={COLORS.bg} />}
                  {!done && <Text style={[styles.setDotText, active && { color: COLORS.primary }]}>{i + 1}</Text>}
                </View>
              );
            })}
          </View>
        )}

        {/* Set done button */}
        {!currentEx?.duration && (
          <TouchableOpacity
            onPress={handleSetDone}
            activeOpacity={0.85}
            disabled={isPaused}
            style={[styles.setDoneBtn, isPaused && { opacity: 0.5 }]}
          >
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.setDoneBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="checkmark-circle" size={22} color={COLORS.bg} />
              <Text style={styles.setDoneBtnText}>Set {currentSet} done</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Exercise list */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>All exercises</Text>
        {exercises.map((ex, i) => (
          <ExerciseCard
            key={i} exercise={ex} index={i}
            isActive={i === currentIdx}
            isCompleted={i < currentIdx || (i === currentIdx && currentSet > totalSets)}
          />
        ))}

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1 },
  // Header
  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingTop: SPACING.base, paddingBottom: SPACING.md },
  backBtn:       { width: 38, height: 38, borderRadius: RADIUS.full, backgroundColor: COLORS.surface2, alignItems: 'center', justifyContent: 'center' },
  workoutTitle:  { fontFamily: FONTS.bold, fontSize: SIZES.lg, color: COLORS.textPrimary },
  workoutMeta:   { fontFamily: FONTS.medium, fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  // Ready
  readyScroll:   { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxl },
  previewRow:    { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.xl, borderWidth: 1, borderColor: COLORS.border },
  previewItem:   { alignItems: 'center', gap: 4 },
  previewLabel:  { fontFamily: FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.textSecondary },
  sectionTitle:  { fontFamily: FONTS.bold, fontSize: SIZES.lg, color: COLORS.textPrimary, marginBottom: SPACING.md },
  startBtn:      { height: 56, borderRadius: RADIUS.full, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  startBtnText:  { fontFamily: FONTS.bold, fontSize: SIZES.base, color: COLORS.bg },
  // Exercise card
  exCard:        { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  exCardActive:  { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '12' },
  exCardDone:    { opacity: 0.5 },
  exNum:         { width: 28, height: 28, borderRadius: RADIUS.full, backgroundColor: COLORS.surface2, alignItems: 'center', justifyContent: 'center' },
  exNumText:     { fontFamily: FONTS.bold, fontSize: SIZES.sm, color: COLORS.textMuted },
  exName:        { fontFamily: FONTS.semiBold, fontSize: SIZES.md, color: COLORS.textPrimary, marginBottom: 2 },
  exMeta:        { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textMuted },
  activeIndicator:{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  // Active top bar
  topBar:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingTop: SPACING.sm, paddingBottom: SPACING.sm },
  quitBtn:       { width: 36, height: 36, borderRadius: RADIUS.full, backgroundColor: COLORS.surface2, alignItems: 'center', justifyContent: 'center' },
  topStats:      { flexDirection: 'row', gap: SPACING.md },
  topStat:       { fontFamily: FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.textSecondary },
  pauseBtn:      { width: 36, height: 36, borderRadius: RADIUS.full, backgroundColor: COLORS.surface2, alignItems: 'center', justifyContent: 'center' },
  // Progress bar
  progressBarWrap:{ height: 3, backgroundColor: COLORS.border, marginHorizontal: SPACING.xl, borderRadius: 2, marginBottom: SPACING.sm },
  progressBar:   { height: 3, backgroundColor: COLORS.primary, borderRadius: 2 },
  // Active scroll
  activeScroll:  { paddingHorizontal: SPACING.xl },
  exCounter:     { fontFamily: FONTS.medium, fontSize: SIZES.sm, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.sm },
  // Timer
  timerText:     { fontFamily: FONTS.black, fontSize: SIZES.xxxl, color: COLORS.primary },
  timerSub:      { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  setDisplay:    { fontFamily: FONTS.black, fontSize: 48, color: COLORS.primary },
  // Exercise name
  currentExName: { fontFamily: FONTS.extraBold, fontSize: SIZES.xxl, color: COLORS.textPrimary, textAlign: 'center', marginBottom: SPACING.xs },
  currentExDetail:{ fontFamily: FONTS.medium, fontSize: SIZES.md, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.lg },
  // Set tracker
  setRow:        { flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm, marginBottom: SPACING.xl },
  setDot:        { width: 40, height: 40, borderRadius: RADIUS.full, backgroundColor: COLORS.surface2, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  setDotActive:  { borderColor: COLORS.primary },
  setDotDone:    { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  setDotText:    { fontFamily: FONTS.bold, fontSize: SIZES.sm, color: COLORS.textMuted },
  // Set done button
  setDoneBtn:    { marginBottom: SPACING.lg },
  setDoneBtnGrad:{ height: 56, borderRadius: RADIUS.full, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  setDoneBtnText:{ fontFamily: FONTS.bold, fontSize: SIZES.base, color: COLORS.bg },
  // Rest
  restContent:   { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  restLabel:     { fontFamily: FONTS.bold, fontSize: SIZES.xl, color: COLORS.textSecondary, marginBottom: SPACING.xl },
  restTimerText: { fontFamily: FONTS.black, fontSize: 48, color: COLORS.info },
  restTimerSub:  { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.textMuted },
  restNextLabel: { fontFamily: FONTS.medium, fontSize: SIZES.sm, color: COLORS.textMuted, marginTop: SPACING.xl },
  restNextEx:    { fontFamily: FONTS.bold, fontSize: SIZES.lg, color: COLORS.textPrimary, textAlign: 'center', marginTop: SPACING.xs },
  skipBtn:       { marginTop: SPACING.xl, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border },
  skipBtnText:   { fontFamily: FONTS.semiBold, fontSize: SIZES.md, color: COLORS.textSecondary },
  // Completed
  completedSafe: { flex: 1 },
  completedContent:{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  completedEmoji:{ fontSize: 64, marginBottom: SPACING.md },
  completedTitle:{ fontFamily: FONTS.black, fontSize: SIZES.h1, color: COLORS.primary, textAlign: 'center', lineHeight: SIZES.h1 * 1.1, marginBottom: SPACING.sm },
  completedSub:  { fontFamily: FONTS.medium, fontSize: SIZES.base, color: COLORS.textSecondary, marginBottom: SPACING.xxxl },
  summaryGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, justifyContent: 'center', marginBottom: SPACING.xxxl },
  summaryCard:   { width: (width - SPACING.xl * 2 - SPACING.md) / 2, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.base, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  summaryValue:  { fontFamily: FONTS.extraBold, fontSize: SIZES.xl, color: COLORS.textPrimary, marginBottom: 2 },
  summaryLabel:  { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.textMuted },
  doneBtn:       { width: '100%' },
  doneBtnGrad:   { height: 56, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center' },
  doneBtnText:   { fontFamily: FONTS.bold, fontSize: SIZES.base, color: COLORS.bg },
});