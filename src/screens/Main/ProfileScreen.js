import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import * as services from '../../api/services';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../../theme';
import { H2, H3, T, Caption, Card, GradientButton, Badge } from '../../components';

const GOALS = ['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];

function SettingRow({ icon, label, value, onPress, rightEl, danger }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={styles.settingRow}
    >
      <View style={[styles.settingIcon, danger && { backgroundColor: COLORS.danger + '18' }]}>
        <Ionicons name={icon} size={18} color={danger ? COLORS.danger : COLORS.primary} />
      </View>
      <T style={[styles.settingLabel, danger && { color: COLORS.danger }]}>{label}</T>
      <View style={{ flex: 1 }} />
      {value && <Caption style={{ marginRight: SPACING.sm }}>{value}</Caption>}
      {rightEl || (onPress && !rightEl && (
        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
      ))}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const [editing, setEditing]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [notifs,  setNotifs]    = useState(true);
  const [form, setForm] = useState({
    name:         user?.name         || '',
    age:          String(user?.age   || ''),
    weight:       String(user?.weight|| ''),
    height:       String(user?.height|| ''),
    fitnessLevel: user?.fitnessLevel || 'beginner',
    goals:        user?.goals        || [],
  });

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const toggleGoal = (g) => {
    setForm(f => ({
      ...f,
      goals: f.goals.includes(g) ? f.goals.filter(x => x !== g) : [...f.goals, g],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await services.updateProfile({
        name:         form.name,
        age:          parseInt(form.age)    || undefined,
        weight:       parseFloat(form.weight) || undefined,
        height:       parseFloat(form.height) || undefined,
        fitnessLevel: form.fitnessLevel,
        goals:        form.goals,
      });
      await refreshUser();
      Toast.show({ type: 'success', text1: 'Profile updated! ✅' });
      setEditing(false);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Update failed', text2: err.response?.data?.message });
    }
    setSaving(false);
  };

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  };

  const initials = user?.name
    ?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: SPACING.xxxl }}>

        {/* Avatar hero */}
        <LinearGradient
          colors={[COLORS.primary + '33', COLORS.bg]}
          style={styles.hero}
        >
          <View style={styles.avatar}>
            <T style={styles.avatarText}>{initials}</T>
          </View>
          <H2 style={{ marginTop: SPACING.md }}>{user?.name}</H2>
          <Caption style={{ marginTop: 4 }}>{user?.email}</Caption>
          <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md }}>
            <Badge label={user?.fitnessLevel || 'beginner'} variant="primary" />
            {user?.goals?.[0] && <Badge label={user.goals[0]} variant="info" />}
          </View>
        </LinearGradient>

        <View style={styles.content}>

          {/* Edit Profile */}
          <View style={styles.sectionHead}>
            <H3>Personal info</H3>
            <TouchableOpacity onPress={() => setEditing(v => !v)}>
              <T style={{ color: COLORS.primary, fontFamily: FONTS.semiBold, fontSize: SIZES.sm }}>
                {editing ? 'Cancel' : 'Edit'}
              </T>
            </TouchableOpacity>
          </View>

          {editing ? (
            <Card style={{ gap: SPACING.md, marginBottom: SPACING.xl }}>
              {/* Name */}
              <View>
                <Caption style={styles.label}>Full name</Caption>
                <TextInput style={styles.input} value={form.name} onChangeText={set('name')} placeholderTextColor={COLORS.textMuted} placeholder="Your name" />
              </View>
              {/* Age / Weight / Height */}
              <View style={{ flexDirection: 'row', gap: SPACING.md }}>
                <View style={{ flex: 1 }}>
                  <Caption style={styles.label}>Age</Caption>
                  <TextInput style={styles.input} value={form.age} onChangeText={set('age')} keyboardType="numeric" placeholder="25" placeholderTextColor={COLORS.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Caption style={styles.label}>Weight (kg)</Caption>
                  <TextInput style={styles.input} value={form.weight} onChangeText={set('weight')} keyboardType="numeric" placeholder="70" placeholderTextColor={COLORS.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Caption style={styles.label}>Height (cm)</Caption>
                  <TextInput style={styles.input} value={form.height} onChangeText={set('height')} keyboardType="numeric" placeholder="175" placeholderTextColor={COLORS.textMuted} />
                </View>
              </View>
              {/* Fitness level */}
              <View>
                <Caption style={styles.label}>Fitness level</Caption>
                <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: 6 }}>
                  {LEVELS.map(l => (
                    <TouchableOpacity
                      key={l}
                      onPress={() => set('fitnessLevel')(l)}
                      style={[styles.levelChip, form.fitnessLevel === l && styles.levelChipActive]}
                    >
                      <Caption style={[form.fitnessLevel === l && { color: COLORS.primary, fontFamily: FONTS.bold }]}>
                        {l}
                      </Caption>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {/* Goals */}
              <View>
                <Caption style={styles.label}>Goals</Caption>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: 6 }}>
                  {GOALS.map(g => (
                    <TouchableOpacity
                      key={g}
                      onPress={() => toggleGoal(g)}
                      style={[styles.goalChip, form.goals.includes(g) && styles.goalChipActive]}
                    >
                      <Caption style={form.goals.includes(g) ? { color: COLORS.primary, fontFamily: FONTS.bold } : {}}>
                        {g}
                      </Caption>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <GradientButton title="Save changes" onPress={handleSave} loading={saving} />
            </Card>
          ) : (
            <Card style={{ marginBottom: SPACING.xl }}>
              {[
                { label: 'Age',    value: user?.age    ? `${user.age} years`  : '—' },
                { label: 'Weight', value: user?.weight ? `${user.weight} kg`  : '—' },
                { label: 'Height', value: user?.height ? `${user.height} cm`  : '—' },
                { label: 'Goal',   value: user?.goals?.[0] || '—' },
                { label: 'Level',  value: user?.fitnessLevel || '—' },
                { label: 'Sessions/week', value: user?.weeklyGoal ? `${user.weeklyGoal}×` : '—' },
              ].map((row, i, arr) => (
                <View key={row.label} style={[styles.infoRow, i < arr.length - 1 && styles.infoRowBorder]}>
                  <Caption>{row.label}</Caption>
                  <T style={{ fontFamily: FONTS.semiBold, fontSize: SIZES.md }}>{row.value}</T>
                </View>
              ))}
            </Card>
          )}

          {/* Settings */}
          <H3 style={{ marginBottom: SPACING.md }}>Settings</H3>
          <Card style={{ marginBottom: SPACING.xl }}>
            <SettingRow
              icon="notifications-outline"
              label="Push notifications"
              rightEl={
                <Switch
                  value={notifs}
                  onValueChange={setNotifs}
                  trackColor={{ false: COLORS.border, true: COLORS.primary + '66' }}
                  thumbColor={notifs ? COLORS.primary : COLORS.textMuted}
                />
              }
            />
            <View style={styles.divider} />
            <SettingRow icon="lock-closed-outline" label="Change password" onPress={() => Toast.show({ type: 'info', text1: 'Coming soon' })} />
            <View style={styles.divider} />
            <SettingRow icon="shield-checkmark-outline" label="Privacy policy" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingRow icon="help-circle-outline" label="Help & support" onPress={() => {}} />
          </Card>

          {/* Danger zone */}
          <Card>
            <SettingRow
              icon="log-out-outline"
              label="Sign out"
              onPress={handleLogout}
              danger
            />
          </Card>

          {/* App version */}
          <Caption style={{ textAlign: 'center', marginTop: SPACING.xl }}>
            FitPro v1.0.0 · Made with ❤️
          </Caption>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.bg },
  hero:      { alignItems: 'center', paddingTop: SPACING.xl, paddingBottom: SPACING.xl },
  avatar:    {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.lg,
  },
  avatarText: { fontFamily: FONTS.black, fontSize: SIZES.xxl, color: COLORS.bg },
  content:   { paddingHorizontal: SPACING.xl },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  label:     { fontFamily: FONTS.semiBold, marginBottom: 4 },
  input:     {
    height: 44, backgroundColor: COLORS.surface2,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md,
    color: COLORS.textPrimary, fontFamily: FONTS.regular,
    fontSize: SIZES.md, borderWidth: 1, borderColor: COLORS.border,
  },
  levelChip:       { paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface2 },
  levelChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '18' },
  goalChip:        { paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface2 },
  goalChipActive:  { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '18' },
  infoRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  settingRow:  { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md },
  settingIcon: { width: 34, height: 34, borderRadius: RADIUS.sm, backgroundColor: COLORS.primary + '18', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  settingLabel:{ fontFamily: FONTS.medium, fontSize: SIZES.md, color: COLORS.textPrimary },
  divider:     { height: 1, backgroundColor: COLORS.border },
});
