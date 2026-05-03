import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES, SPACING, RADIUS } from '../../theme';
import { H1, T, GradientButton, OutlineButton, Caption } from '../../components';

const STATS = [
  { value: '5K+', label: 'Active users' },
  { value: '200+', label: 'Workouts' },
  { value: '98%', label: 'Satisfaction' },
];

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0F2027', '#203A43', '#2C5364']} style={StyleSheet.absoluteFillObject} />
      <View style={[styles.circle, { width: 320, height: 320, top: -80, right: -80 }]} />
      <View style={[styles.circle, { width: 200, height: 200, top: 80, right: 30, opacity: 0.04 }]} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.logoArea}>
          <View style={styles.logoIcon}>
            <T style={{ fontSize: 30 }}>⚡</T>
          </View>
          <T style={styles.logoText}>FitPro</T>
          <Caption>AI Personal Trainer</Caption>
        </View>
        <View style={styles.heroArea}>
          <H1 style={styles.heroTitle}>Train{'\n'}Smarter{'\n'}Every Day</H1>
          <T style={styles.heroSub}>
            AI-powered fitness coaching — personalized workouts, real-time tracking, and daily motivation.
          </T>
        </View>
        <View style={styles.statsRow}>
          {STATS.map((s, i) => (
            <View key={i} style={styles.statItem}>
              <T style={styles.statValue}>{s.value}</T>
              <Caption>{s.label}</Caption>
            </View>
          ))}
        </View>
        <View style={styles.ctas}>
          <GradientButton title="Get Started — It's Free" onPress={() => navigation.navigate('Register')} style={{ marginBottom: SPACING.md }} />
          <OutlineButton title="Sign In" onPress={() => navigation.navigate('Login')} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: SPACING.xl, justifyContent: 'space-between', paddingVertical: SPACING.lg },
  circle: { position: 'absolute', borderRadius: 999, borderWidth: 1, borderColor: COLORS.primary, opacity: 0.07 },
  logoArea: { alignItems: 'center', marginTop: SPACING.lg },
  logoIcon: { width: 60, height: 60, borderRadius: RADIUS.lg, backgroundColor: COLORS.primary + '22', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  logoText: { fontFamily: FONTS.black, fontSize: SIZES.xl, color: COLORS.primary, letterSpacing: 2 },
  heroArea: { flex: 1, justifyContent: 'center' },
  heroTitle: { lineHeight: SIZES.h1 * 1.12, marginBottom: SPACING.lg },
  heroSub: { color: COLORS.textSecondary, lineHeight: 24, maxWidth: '88%' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: COLORS.surface + 'AA', borderRadius: RADIUS.lg, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.xl },
  statItem: { alignItems: 'center' },
  statValue: { fontFamily: FONTS.extraBold, fontSize: SIZES.xl, color: COLORS.primary },
  ctas: {},
});
