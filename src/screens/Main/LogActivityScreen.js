import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as services from '../../api/services';
import { COLORS, FONTS, SIZES, SPACING, RADIUS } from '../../theme';
import { H2, H3, T, Caption, Card, GradientButton } from '../../components';

const ACTIVITY_TYPES = [
  { value:'workout', label:'Workout', emoji:'🏋️' },
  { value:'run',     label:'Run',     emoji:'🏃' },
  { value:'cycle',   label:'Cycle',   emoji:'🚴' },
  { value:'steps',   label:'Steps',   emoji:'👟' },
  { value:'swim',    label:'Swim',    emoji:'🏊' },
  { value:'yoga',    label:'Yoga',    emoji:'🧘' },
];

export default function LogActivityScreen() {
  const [type, setType]     = useState('workout');
  const [duration, setDur]  = useState('');
  const [calories, setCal]  = useState('');
  const [steps, setSteps]   = useState('');
  const [notes, setNotes]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleLog = async () => {
    if (!duration) { Toast.show({ type: 'error', text1: 'Enter duration' }); return; }
    setLoading(true);
    try {
      await services.logActivity({
        type,
        duration: parseInt(duration),
        calories: parseInt(calories) || undefined,
        steps:    parseInt(steps)    || undefined,
        notes,
        source: 'manual',
        date: new Date().toISOString(),
      });
      Toast.show({ type: 'success', text1: 'Activity logged! 🎉' });
      setDur(''); setCal(''); setSteps(''); setNotes('');
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to log', text2: err.response?.data?.message });
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <H2 style={{ marginBottom: SPACING.xs }}>Log Activity</H2>
        <Caption style={{ marginBottom: SPACING.xl }}>Record what you did today</Caption>

        {/* Activity type */}
        <H3 style={{ marginBottom: SPACING.md }}>Activity type</H3>
        <View style={styles.typeGrid}>
          {ACTIVITY_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              onPress={() => setType(t.value)}
              style={[styles.typeItem, type === t.value && styles.typeItemActive]}
              activeOpacity={0.8}
            >
              <T style={{ fontSize: 28, marginBottom: 4 }}>{t.emoji}</T>
              <Caption style={[type === t.value && { color: COLORS.primary, fontFamily: FONTS.bold }]}>{t.label}</Caption>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats */}
        <H3 style={{ marginBottom: SPACING.md }}>Details</H3>
        <Card style={{ gap: SPACING.md }}>
          <View>
            <Caption style={styles.fieldLabel}>Duration (minutes) *</Caption>
            <TextInput
              style={styles.field}
              placeholder="e.g. 45"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
              value={duration}
              onChangeText={setDur}
            />
          </View>
          <View>
            <Caption style={styles.fieldLabel}>Calories burned</Caption>
            <TextInput style={styles.field} placeholder="e.g. 320" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" value={calories} onChangeText={setCal} />
          </View>
          {type === 'steps' && (
            <View>
              <Caption style={styles.fieldLabel}>Steps</Caption>
              <TextInput style={styles.field} placeholder="e.g. 8000" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" value={steps} onChangeText={setSteps} />
            </View>
          )}
          <View>
            <Caption style={styles.fieldLabel}>Notes (optional)</Caption>
            <TextInput
              style={[styles.field, { height: 80, textAlignVertical: 'top', paddingTop: SPACING.sm }]}
              placeholder="How did it go?"
              placeholderTextColor={COLORS.textMuted}
              multiline
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        </Card>

        <GradientButton title="Log Activity" onPress={handleLog} loading={loading} style={{ marginTop: SPACING.xl, marginBottom: SPACING.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.base, paddingBottom: SPACING.xxxl },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xl },
  typeItem: { width: '30%', alignItems: 'center', backgroundColor: COLORS.surface2, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, borderWidth: 1.5, borderColor: COLORS.border },
  typeItemActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '18' },
  fieldLabel: { marginBottom: 6, fontFamily: FONTS.semiBold },
  field: { height: 48, backgroundColor: COLORS.surface2, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, color: COLORS.textPrimary, fontFamily: FONTS.regular, fontSize: SIZES.base, borderWidth: 1, borderColor: COLORS.border },
});
