import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SIZES } from '../../theme';
import { T } from '../../components';

export default function SplashScreen() {
  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0F2027','#2C5364']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.center}>
        <T style={styles.logo}>⚡</T>
        <T style={styles.name}>FitPro</T>
        <T style={styles.tag}>AI Personal Trainer</T>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 56, marginBottom: 12 },
  name: { fontFamily: FONTS.black, fontSize: SIZES.xxxl, color: COLORS.primary, letterSpacing: 3 },
  tag: { color: COLORS.textSecondary, marginTop: 8, letterSpacing: 1 },
});
