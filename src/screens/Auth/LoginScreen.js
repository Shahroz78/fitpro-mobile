import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SIZES, SPACING, RADIUS } from '../../theme';
import { H2, T, Caption, Input, GradientButton } from '../../components';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k) => (v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email.trim().toLowerCase(), form.password);
      Toast.show({ type: 'success', text1: 'Welcome back! 💪' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Login failed', text2: err.response?.data?.message || 'Check your credentials' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={['#0F2027', '#203A43']} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Back */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <T style={styles.emoji}>👋</T>
            <H2 style={{ marginBottom: SPACING.xs }}>Welcome back</H2>
            <Caption>Sign in to continue your fitness journey</Caption>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email address"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={set('email')}
              error={errors.email}
            />
            <View style={{ position: 'relative' }}>
              <Input
                label="Password"
                placeholder="••••••••"
                secureTextEntry={!showPw}
                value={form.password}
                onChangeText={set('password')}
                error={errors.password}
              />
              <TouchableOpacity onPress={() => setShowPw(v => !v)} style={styles.eyeBtn}>
                <Ionicons name={showPw ? 'eye-off' : 'eye'} size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <GradientButton title="Sign In" onPress={handleLogin} loading={loading} style={{ marginTop: SPACING.sm }} />
          </View>

          {/* Register link */}
          <View style={styles.footer}>
            <Caption>Don't have an account? </Caption>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <T style={{ color: COLORS.primary, fontFamily: FONTS.bold }}>Sign up</T>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg },
  back: { width: 40, height: 40, borderRadius: RADIUS.full, backgroundColor: COLORS.surface2, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
  header: { marginBottom: SPACING.xxxl },
  emoji: { fontSize: 40, marginBottom: SPACING.base },
  form: { gap: 4 },
  eyeBtn: { position: 'absolute', right: SPACING.base, top: 38 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl, alignItems: 'center' },
});
