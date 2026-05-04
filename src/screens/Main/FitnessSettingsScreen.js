/**
 * FitnessSettingsScreen.js
 * Fully customizable fitness preferences:
 * - Calorie goal, daily step goal, water intake
 * - Workout preferences (type, duration, days/week)
 * - Notification schedule
 * - Units (kg/lbs, km/miles)
 * All settings saved to AsyncStorage + synced to backend profile
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import * as services from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SIZES, SPACING, RADIUS } from '../../theme';

const WORKOUT_TYPES = ['HIIT', 'Cardio', 'Strength', 'Yoga', 'Flexibility'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DURATION_OPTIONS = [20, 30, 45, 60, 75, 90];

/* ── Section wrapper ──────────────────────────────── */
function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

/* ── Row types ────────────────────────────────────── */
function ToggleRow({ icon, label, sub, value, onChange }) {
  return (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: COLORS.primary + '18' }]}>
        <Ionicons name={icon} size={18} color={COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: COLORS.border, true: COLORS.primary + '66' }}
        thumbColor={value ? COLORS.primary : COLORS.textMuted}
      />
    </View>
  );
}

function NumberRow({ icon, label, sub, value, onChange, unit, min = 0, max = 99999, step = 1 }) {
  return (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: COLORS.secondary + '18' }]}>
        <Ionicons name={icon} size={18} color={COLORS.secondary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      <View style={styles.stepper}>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => onChange(Math.max(min, value - step))}
        >
          <Text style={styles.stepBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.stepValue}>{value}<Text style={styles.stepUnit}> {unit}</Text></Text>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => onChange(Math.min(max, value + step))}
        >
          <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DividerRow() {
  return <View style={styles.divider} />;
}

export default function FitnessSettingsScreen({ navigation }) {
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);

  // ── Settings state ─────────────────────────────────
  // Calorie & nutrition goals
  const [calorieGoal,  setCalorieGoal]  = useState(2000);
  const [proteinGoal,  setProteinGoal]  = useState(120);
  const [waterGoal,    setWaterGoal]    = useState(8);    // glasses
  const [stepGoal,     setStepGoal]     = useState(10000);

  // Workout preferences
  const [prefTypes,    setPrefTypes]    = useState(['HIIT', 'Cardio']);
  const [prefDuration, setPrefDuration] = useState(45);
  const [prefDays,     setPrefDays]     = useState(['Mon', 'Wed', 'Fri']);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(3);

  // Units
  const [useMetric,    setUseMetric]    = useState(true);  // kg vs lbs

  // Notifications
  const [notifWorkout, setNotifWorkout] = useState(true);
  const [notifWater,   setNotifWater]   = useState(false);
  const [notifProgress,setNotifProgress]= useState(true);
  const [notifReminder,setNotifReminder]= useState(true);

  // Rest timer
  const [defaultRest,  setDefaultRest]  = useState(60);  // seconds

  // Load saved settings on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('fitpro_settings');
        if (saved) {
          const s = JSON.parse(saved);
          if (s.calorieGoal)   setCalorieGoal(s.calorieGoal);
          if (s.proteinGoal)   setProteinGoal(s.proteinGoal);
          if (s.waterGoal)     setWaterGoal(s.waterGoal);
          if (s.stepGoal)      setStepGoal(s.stepGoal);
          if (s.prefTypes)     setPrefTypes(s.prefTypes);
          if (s.prefDuration)  setPrefDuration(s.prefDuration);
          if (s.prefDays)      setPrefDays(s.prefDays);
          if (s.sessionsPerWeek) setSessionsPerWeek(s.sessionsPerWeek);
          if (s.useMetric !== undefined) setUseMetric(s.useMetric);
          if (s.notifWorkout !== undefined) setNotifWorkout(s.notifWorkout);
          if (s.notifWater   !== undefined) setNotifWater(s.notifWater);
          if (s.notifProgress!== undefined) setNotifProgress(s.notifProgress);
          if (s.notifReminder!== undefined) setNotifReminder(s.notifReminder);
          if (s.defaultRest)   setDefaultRest(s.defaultRest);
        }
        // Pre-fill from user profile
        if (user?.weeklyGoal)      setSessionsPerWeek(user.weeklyGoal);
        if (user?.preferredWorkouts?.length) setPrefTypes(user.preferredWorkouts);
      } catch {}
    })();
  }, []);

  const toggleType = (t) => {
    setPrefTypes(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  const toggleDay = (d) => {
    setPrefDays(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const settings = {
      calorieGoal, proteinGoal, waterGoal, stepGoal,
      prefTypes, prefDuration, prefDays, sessionsPerWeek,
      useMetric, notifWorkout, notifWater, notifProgress,
      notifReminder, defaultRest,
    };

    try {
      // Save locally
      await AsyncStorage.setItem('fitpro_settings', JSON.stringify(settings));

      // Sync relevant fields to backend profile
      await services.updateProfile({
        preferredWorkouts: prefTypes,
        weeklyGoal: sessionsPerWeek,
      });

      await refreshUser();
      Toast.show({ type: 'success', text1: 'Settings saved! ✅' });
      navigation.goBack();
    } catch (err) {
      // Save locally even if backend fails
      Toast.show({ type: 'success', text1: 'Settings saved locally ✅' });
      navigation.goBack();
    }
    setSaving(false);
  };

  const handleReset = () => {
    Alert.alert('Reset settings', 'Reset all settings to defaults?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('fitpro_settings');
          setCalorieGoal(2000); setProteinGoal(120); setWaterGoal(8);
          setStepGoal(10000); setPrefTypes(['HIIT', 'Cardio']);
          setPrefDuration(45); setPrefDays(['Mon', 'Wed', 'Fri']);
          setSessionsPerWeek(3); setUseMetric(true);
          setNotifWorkout(true); setNotifWater(false);
          setNotifProgress(true); setNotifReminder(true);
          setDefaultRest(60);
          Toast.show({ type: 'info', text1: 'Settings reset to defaults' });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fitness Settings</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Calorie & Nutrition Goals ── */}
        <Section title="🔥 Calorie & nutrition goals">
          <NumberRow icon="flame-outline"    label="Daily calorie goal" sub="Target calories per day"
            value={calorieGoal} onChange={setCalorieGoal} unit="kcal" min={1000} max={5000} step={50} />
          <DividerRow />
          <NumberRow icon="barbell-outline"  label="Protein goal" sub="Daily protein target"
            value={proteinGoal} onChange={setProteinGoal} unit="g" min={20} max={300} step={5} />
          <DividerRow />
          <NumberRow icon="water-outline"    label="Water intake goal" sub="Glasses of water per day"
            value={waterGoal}   onChange={setWaterGoal}   unit="glasses" min={1} max={20} step={1} />
          <DividerRow />
          <NumberRow icon="footsteps-outline"label="Daily step goal"   sub="Steps to walk each day"
            value={stepGoal}    onChange={setStepGoal}    unit="steps" min={1000} max={30000} step={500} />
        </Section>

        {/* ── Workout Preferences ── */}
        <Section title="💪 Workout preferences">
          <View style={styles.subLabel}>
            <Text style={styles.subLabelText}>Preferred workout types</Text>
          </View>
          <View style={styles.chipRow}>
            {WORKOUT_TYPES.map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => toggleType(t)}
                style={[styles.chip, prefTypes.includes(t) && styles.chipActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, prefTypes.includes(t) && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <DividerRow />
          <View style={styles.subLabel}>
            <Text style={styles.subLabelText}>Preferred workout duration</Text>
          </View>
          <View style={styles.chipRow}>
            {DURATION_OPTIONS.map(d => (
              <TouchableOpacity
                key={d}
                onPress={() => setPrefDuration(d)}
                style={[styles.chip, prefDuration === d && styles.chipActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, prefDuration === d && styles.chipTextActive]}>{d} min</Text>
              </TouchableOpacity>
            ))}
          </View>

          <DividerRow />
          <NumberRow icon="calendar-outline" label="Sessions per week" sub="How many times you train"
            value={sessionsPerWeek} onChange={setSessionsPerWeek} unit="×/wk" min={1} max={7} step={1} />

          <DividerRow />
          <View style={styles.subLabel}>
            <Text style={styles.subLabelText}>Preferred training days</Text>
          </View>
          <View style={styles.chipRow}>
            {DAYS.map(d => (
              <TouchableOpacity
                key={d}
                onPress={() => toggleDay(d)}
                style={[styles.chip, prefDays.includes(d) && styles.chipActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, prefDays.includes(d) && styles.chipTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* ── Workout Settings ── */}
        <Section title="⚙️ Workout settings">
          <NumberRow icon="timer-outline" label="Default rest time" sub="Seconds between sets"
            value={defaultRest} onChange={setDefaultRest} unit="sec" min={15} max={300} step={15} />
          <DividerRow />
          <ToggleRow icon="scale-outline" label="Use metric units" sub={useMetric ? 'kg, km, °C' : 'lbs, miles, °F'}
            value={useMetric} onChange={setUseMetric} />
        </Section>

        {/* ── Notifications ── */}
        <Section title="🔔 Notifications">
          <ToggleRow icon="barbell-outline"   label="Workout reminders"  sub="Daily workout push notifications"
            value={notifWorkout}  onChange={setNotifWorkout} />
          <DividerRow />
          <ToggleRow icon="water-outline"     label="Water reminders"    sub="Remind me to drink water"
            value={notifWater}    onChange={setNotifWater} />
          <DividerRow />
          <ToggleRow icon="trending-up-outline"label="Progress updates"  sub="Weekly progress summary"
            value={notifProgress} onChange={setNotifProgress} />
          <DividerRow />
          <ToggleRow icon="alarm-outline"     label="Daily reminder"     sub="Morning motivation message"
            value={notifReminder} onChange={setNotifReminder} />
        </Section>

        {/* Save button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>
            {saving ? 'Saving…' : 'Save settings'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.bg },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn:      { width: 36, height: 36, borderRadius: RADIUS.full, backgroundColor: COLORS.surface2, alignItems: 'center', justifyContent: 'center' },
  headerTitle:  { fontFamily: FONTS.bold, fontSize: SIZES.lg, color: COLORS.textPrimary },
  resetText:    { fontFamily: FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.danger },
  scroll:       { paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg },
  section:      { marginBottom: SPACING.xl },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: SIZES.md, color: COLORS.textPrimary, marginBottom: SPACING.md },
  sectionCard:  { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  row:          { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.base, paddingVertical: SPACING.md },
  rowIcon:      { width: 36, height: 36, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  rowLabel:     { fontFamily: FONTS.semiBold, fontSize: SIZES.md, color: COLORS.textPrimary },
  rowSub:       { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textMuted, marginTop: 1 },
  divider:      { height: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.base },
  stepper:      { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  stepBtn:      { width: 30, height: 30, borderRadius: RADIUS.full, backgroundColor: COLORS.surface2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  stepBtnText:  { fontFamily: FONTS.bold, fontSize: SIZES.lg, color: COLORS.textPrimary, lineHeight: 22 },
  stepValue:    { fontFamily: FONTS.bold, fontSize: SIZES.md, color: COLORS.textPrimary, minWidth: 52, textAlign: 'center' },
  stepUnit:     { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textMuted },
  subLabel:     { paddingHorizontal: SPACING.base, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  subLabelText: { fontFamily: FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.textSecondary },
  chipRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, paddingHorizontal: SPACING.base, paddingBottom: SPACING.md },
  chip:         { paddingHorizontal: SPACING.md, paddingVertical: 7, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface2 },
  chipActive:   { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '18' },
  chipText:     { fontFamily: FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.textSecondary },
  chipTextActive:{ color: COLORS.primary },
  saveBtn:      { backgroundColor: COLORS.primary, borderRadius: RADIUS.full, height: 54, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  saveBtnText:  { fontFamily: FONTS.bold, fontSize: SIZES.base, color: COLORS.bg },
});