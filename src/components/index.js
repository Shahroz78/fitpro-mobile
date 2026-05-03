import React from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  StyleSheet, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../theme';

/* ── Typography ──────────────────────────────────── */
export const T = ({ style, children, ...p }) => (
  <Text style={[{ fontFamily: FONTS.regular, color: COLORS.textPrimary, fontSize: SIZES.base }, style]} {...p}>
    {children}
  </Text>
);
export const H1 = ({ style, children, ...p }) => (
  <Text style={[{ fontFamily: FONTS.black, color: COLORS.textPrimary, fontSize: SIZES.h1, lineHeight: SIZES.h1 * 1.1 }, style]} {...p}>
    {children}
  </Text>
);
export const H2 = ({ style, children, ...p }) => (
  <Text style={[{ fontFamily: FONTS.extraBold, color: COLORS.textPrimary, fontSize: SIZES.xxl }, style]} {...p}>
    {children}
  </Text>
);
export const H3 = ({ style, children, ...p }) => (
  <Text style={[{ fontFamily: FONTS.bold, color: COLORS.textPrimary, fontSize: SIZES.xl }, style]} {...p}>
    {children}
  </Text>
);
export const Caption = ({ style, children, ...p }) => (
  <Text style={[{ fontFamily: FONTS.medium, color: COLORS.textSecondary, fontSize: SIZES.sm }, style]} {...p}>
    {children}
  </Text>
);

/* ── Gradient Button ─────────────────────────────── */
export function GradientButton({ onPress, title, loading, disabled, style }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.85} style={style}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={[styles.gradBtn, disabled && { opacity: 0.5 }]}
      >
        {loading
          ? <ActivityIndicator color={COLORS.bg} size="small" />
          : <Text style={styles.gradBtnText}>{title}</Text>
        }
      </LinearGradient>
    </TouchableOpacity>
  );
}

/* ── Outline Button ──────────────────────────────── */
export function OutlineButton({ onPress, title, style }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={[styles.outlineBtn, style]}>
      <Text style={styles.outlineBtnText}>{title}</Text>
    </TouchableOpacity>
  );
}

/* ── Input ───────────────────────────────────────── */
export function Input({ label, error, style, ...props }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <View style={[styles.inputWrap, style]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        placeholderTextColor={COLORS.textMuted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          focused && styles.inputFocused,
          error && styles.inputError,
        ]}
        {...props}
      />
      {error && <Text style={styles.inputErrorText}>{error}</Text>}
    </View>
  );
}

/* ── Card ────────────────────────────────────────── */
export function Card({ children, style }) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

/* ── Badge ───────────────────────────────────────── */
export function Badge({ label, variant = 'primary' }) {
  const variants = {
    primary: { bg: COLORS.primaryLight, color: COLORS.primaryDark },
    warning: { bg: '#2D2000',           color: COLORS.warning },
    danger:  { bg: '#2D0A0A',           color: COLORS.danger },
    info:    { bg: '#001A2D',           color: COLORS.info },
    muted:   { bg: COLORS.surface2,     color: COLORS.textSecondary },
  };
  const v = variants[variant] || variants.primary;
  return (
    <View style={[styles.badge, { backgroundColor: v.bg }]}>
      <Text style={[styles.badgeText, { color: v.color }]}>{label}</Text>
    </View>
  );
}

/* ── Stat Card ───────────────────────────────────── */
export function StatCard({ label, value, icon, color = COLORS.primary, style }) {
  return (
    <Card style={[styles.statCard, style]}>
      <View style={[styles.statIconWrap, { backgroundColor: color + '22' }]}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Caption style={{ textAlign: 'center', marginTop: 2 }}>{label}</Caption>
    </Card>
  );
}

/* ── Section Header ──────────────────────────────── */
export function SectionHeader({ title, onSeeAll }) {
  return (
    <View style={styles.sectionHeader}>
      <H3>{title}</H3>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <T style={{ color: COLORS.primary, fontSize: SIZES.sm, fontFamily: FONTS.semiBold }}>See all</T>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ── Empty State ─────────────────────────────────── */
export function EmptyState({ icon, title, subtitle }) {
  return (
    <View style={styles.emptyState}>
      <Text style={{ fontSize: 48, marginBottom: SPACING.md }}>{icon}</Text>
      <H3 style={{ textAlign: 'center', marginBottom: SPACING.sm }}>{title}</H3>
      <Caption style={{ textAlign: 'center', lineHeight: 20 }}>{subtitle}</Caption>
    </View>
  );
}

/* ── Loading Screen ──────────────────────────────── */
export function LoadingScreen() {
  return (
    <View style={styles.loadingScreen}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

/* ── Styles ──────────────────────────────────────── */
const styles = StyleSheet.create({
  gradBtn: {
    height: 54, borderRadius: RADIUS.full,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  gradBtnText: {
    fontFamily: FONTS.bold, fontSize: SIZES.base,
    color: COLORS.bg, letterSpacing: 0.5,
  },
  outlineBtn: {
    height: 52, borderRadius: RADIUS.full,
    borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  outlineBtnText: {
    fontFamily: FONTS.semiBold, fontSize: SIZES.base,
    color: COLORS.textPrimary,
  },
  inputWrap: { gap: SPACING.xs, marginBottom: SPACING.md },
  inputLabel: {
    fontFamily: FONTS.semiBold, fontSize: SIZES.sm,
    color: COLORS.textSecondary, marginBottom: 4,
  },
  input: {
    height: 52, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.surface2,
    color: COLORS.textPrimary,
    fontFamily: FONTS.regular, fontSize: SIZES.base,
    paddingHorizontal: SPACING.base,
  },
  inputFocused: { borderColor: COLORS.primary },
  inputError:   { borderColor: COLORS.danger },
  inputErrorText: { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.danger },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  badge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: RADIUS.full, alignSelf: 'flex-start',
  },
  badgeText: { fontFamily: FONTS.semiBold, fontSize: SIZES.xs },
  statCard: {
    alignItems: 'center', padding: SPACING.base,
    flex: 1,
  },
  statIconWrap: {
    width: 44, height: 44, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontFamily: FONTS.extraBold, fontSize: SIZES.xxl,
    marginBottom: 2,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md, marginTop: SPACING.xl,
  },
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: SPACING.xxxl,
  },
  loadingScreen: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.bg,
  },
});
