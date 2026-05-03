import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SIZES, SPACING, RADIUS } from '../../theme';
import { H2, T, Caption, Input, GradientButton } from '../../components';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k) => (v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (form.password.length < 6) e.password = 'Min 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name.trim(), form.email.trim().toLowerCase(), form.password);
      // After register, AuthContext sets isAuthenticated=true which swaps
      // the navigator to AppStack. AppStack's first screen IS Onboarding,
      // so the user lands there automatically — no manual navigate needed.
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Registration failed', text2: err.response?.data?.message || 'Please try again' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={['#0F2027', '#203A43']} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.header}>
            <T style={styles.emoji}>🏃</T>
            <H2 style={{ marginBottom: SPACING.xs }}>Create account</H2>
            <Caption>Join 5,000+ users training with AI</Caption>
          </View>
          <View style={styles.form}>
            <Input label="Full name" placeholder="Ayesha Raza" value={form.name} onChangeText={set('name')} error={errors.name} />
            <Input label="Email address" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={set('email')} error={errors.email} />
            <View style={{ position: 'relative' }}>
              <Input label="Password" placeholder="Min 6 characters" secureTextEntry={!showPw} value={form.password} onChangeText={set('password')} error={errors.password} />
              <TouchableOpacity onPress={() => setShowPw(v => !v)} style={styles.eyeBtn}>
                <Ionicons name={showPw ? 'eye-off' : 'eye'} size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            <Input label="Confirm password" placeholder="Re-enter password" secureTextEntry value={form.confirm} onChangeText={set('confirm')} error={errors.confirm} />
            <GradientButton title="Create Account" onPress={handleRegister} loading={loading} style={{ marginTop: SPACING.sm }} />
          </View>
          <View style={styles.footer}>
            <Caption>Already have an account? </Caption>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <T style={{ color: COLORS.primary, fontFamily: FONTS.bold }}>Sign in</T>
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
  header: { marginBottom: SPACING.xl },
  emoji: { fontSize: 40, marginBottom: SPACING.base },
  form: { gap: 4 },
  eyeBtn: { position: 'absolute', right: SPACING.base, top: 38 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl, alignItems: 'center' },
});