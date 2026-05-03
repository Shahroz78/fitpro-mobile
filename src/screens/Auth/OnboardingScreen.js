import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as services from '../../api/services';
import { COLORS, FONTS, SIZES, SPACING, RADIUS } from '../../theme';
import { H2, H3, T, Caption, GradientButton } from '../../components';

const STEPS = [
  {
    title: 'What is your main goal?',
    field: 'goal',
    options: [
      { label: 'Weight Loss', emoji: '🔥', value: 'Weight Loss' },
      { label: 'Muscle Gain', emoji: '💪', value: 'Muscle Gain' },
      { label: 'Endurance',   emoji: '🏃', value: 'Endurance' },
      { label: 'Flexibility', emoji: '🧘', value: 'Flexibility' },
    ],
  },
  {
    title: 'Your fitness level?',
    field: 'level',
    options: [
      { label: 'Beginner',     emoji: '🌱', value: 'beginner',     desc: 'Just starting out' },
      { label: 'Intermediate', emoji: '⚡', value: 'intermediate', desc: 'Some experience' },
      { label: 'Advanced',     emoji: '🏆', value: 'advanced',     desc: 'Serious athlete' },
    ],
  },
  {
    title: 'Sessions per week?',
    field: 'sessions',
    options: [
      { label: '2–3 times', emoji: '📅', value: 3 },
      { label: '4–5 times', emoji: '🗓️', value: 5 },
      { label: 'Every day', emoji: '⚡', value: 7 },
    ],
  },
];

export default function OnboardingScreen({ navigation }) {
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  const current = STEPS[step];
  const selected = answers[current.field];

  const pick = (value) => setAnswers(a => ({ ...a, [current.field]: value }));

  const next = async () => {
    if (!selected && selected !== 0) {
      Toast.show({ type: 'error', text1: 'Please select an option' });
      return;
    }
    if (step < STEPS.length - 1) { setStep(s => s + 1); return; }
    // Final step — save profile then go to Main tabs
    setLoading(true);
    try {
      await services.updateProfile({
        goals: [answers.goal],
        fitnessLevel: answers.level,
        weeklyGoal: answers.sessions,
      });
      Toast.show({ type: 'success', text1: 'Profile saved! 🎉', text2: 'Your AI plan is ready' });
      navigation.replace('Main');
    } catch {
      // Even if save fails, let user into the app
      navigation.replace('Main');
    }
    setLoading(false);
  };

  const progress = (step + 1) / STEPS.length;

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={['#0F2027','#203A43']} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* Progress bar */}
          <View style={styles.progressWrap}>
            {STEPS.map((_, i) => (
              <View key={i} style={[styles.progressDot, i <= step && styles.progressDotActive]} />
            ))}
          </View>

          <Caption style={{ marginBottom: SPACING.xs }}>Step {step + 1} of {STEPS.length}</Caption>
          <H2 style={{ marginBottom: SPACING.xl }}>{current.title}</H2>

          <View style={styles.options}>
            {current.options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                activeOpacity={0.8}
                onPress={() => pick(opt.value)}
                style={[styles.option, selected === opt.value && styles.optionSelected]}
              >
                <T style={styles.optionEmoji}>{opt.emoji}</T>
                <View style={{ flex: 1 }}>
                  <T style={[styles.optionLabel, selected === opt.value && styles.optionLabelSelected]}>
                    {opt.label}
                  </T>
                  {opt.desc && <Caption style={{ marginTop: 2 }}>{opt.desc}</Caption>}
                </View>
                {selected === opt.value && (
                  <View style={styles.checkCircle}>
                    <T style={{ color: COLORS.bg, fontSize: 12 }}>✓</T>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <GradientButton
            title={step < STEPS.length - 1 ? 'Continue' : 'Start Training! 🚀'}
            onPress={next}
            loading={loading}
            style={{ marginTop: 'auto' }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg },
  progressWrap: { flexDirection: 'row', gap: 8, marginBottom: SPACING.lg },
  progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: COLORS.border },
  progressDotActive: { backgroundColor: COLORS.primary },
  options: { gap: SPACING.md, marginBottom: SPACING.xl },
  option: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: COLORS.surface2, borderRadius: RADIUS.lg, padding: SPACING.base, borderWidth: 1.5, borderColor: COLORS.border },
  optionSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '18' },
  optionEmoji: { fontSize: 28 },
  optionLabel: { fontFamily: FONTS.semiBold, fontSize: SIZES.base, color: COLORS.textSecondary },
  optionLabelSelected: { color: COLORS.primary },
  checkCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
});