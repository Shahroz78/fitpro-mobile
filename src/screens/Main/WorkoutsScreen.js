import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as services from '../../api/services';
import { COLORS, FONTS, SIZES, SPACING, RADIUS } from '../../theme';
import { H2, H3, T, Caption, Badge, SectionHeader } from '../../components';

const TYPE_COLORS = { HIIT: COLORS.secondary, Cardio: COLORS.info, Strength: COLORS.primary, Yoga: '#A78BFA', Flexibility: COLORS.warning };
const FILTERS = ['All', 'HIIT', 'Cardio', 'Strength', 'Yoga'];
const LEVEL_VARIANT = { beginner: 'primary', intermediate: 'warning', advanced: 'danger' };

function WorkoutCard({ item, onPress }) {
  const color = TYPE_COLORS[item.type] || COLORS.primary;
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.85}>
      <LinearGradient colors={[color + '22', COLORS.surface]} style={styles.cardGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.cardTop}>
          <View style={[styles.typeDot, { backgroundColor: color }]} />
          <Caption style={{ color, fontFamily: FONTS.bold }}>{item.type}</Caption>
          <View style={{ flex: 1 }} />
          <Badge label={item.level} variant={LEVEL_VARIANT[item.level]} />
        </View>
        <H3 style={{ marginBottom: SPACING.xs }}>{item.name}</H3>
        <Caption style={{ marginBottom: SPACING.base, lineHeight: 18 }}>{item.description || `${item.type} workout — ${item.goal}`}</Caption>
        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
            <Caption style={{ marginLeft: 4 }}>{item.duration} min</Caption>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="barbell-outline" size={14} color={COLORS.textMuted} />
            <Caption style={{ marginLeft: 4 }}>{item.exercises?.length || '—'} exercises</Caption>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
            <Caption style={{ marginLeft: 4 }}>{item.daysPerWeek}×/week</Caption>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function WorkoutsScreen({ navigation }) {
  const [workouts, setWorkouts] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await services.getWorkouts({ limit: 20 });
        setWorkouts(res.data.workouts || []);
      } catch { setWorkouts([]); }
      setLoading(false);
    })();
  }, []);

  const getAI = async () => {
    setAiLoading(true);
    try {
      const res = await services.getRecommend({});
      const top = res.data.recommendations?.[0];
      if (top) navigation.navigate('WorkoutDetail', { workout: top });
    } catch {}
    setAiLoading(false);
  };

  const filtered = workouts.filter(w => {
    const matchType   = filter === 'All' || w.type === filter;
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <H2>Workouts</H2>
        <TouchableOpacity style={styles.aiBtn} onPress={getAI} activeOpacity={0.8} disabled={aiLoading}>
          {aiLoading
            ? <ActivityIndicator size="small" color={COLORS.bg} />
            : <><T style={styles.aiBtnText}>⚡ AI Pick</T></>
          }
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          placeholder="Search workouts..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* Filter chips */}
      <View style={{ paddingLeft: SPACING.xl, marginBottom: SPACING.base }}>
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={i => i}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilter(item)}
              style={[styles.chip, filter === item && styles.chipActive]}
              activeOpacity={0.8}
            >
              <T style={[styles.chipText, filter === item && styles.chipTextActive]}>{item}</T>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading
        ? <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        : <FlatList
            data={filtered}
            keyExtractor={i => i._id}
            renderItem={({ item }) => (
              <WorkoutCard item={item} onPress={w => navigation.navigate('WorkoutDetail', { workout: w })} />
            )}
            contentContainerStyle={{ paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxl }}
            showsVerticalScrollIndicator={false}
          />
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingTop: SPACING.base, marginBottom: SPACING.base },
  aiBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 8 },
  aiBtnText: { fontFamily: FONTS.bold, fontSize: SIZES.sm, color: COLORS.bg },
  searchWrap: { flexDirection: 'row', alignItems: 'center', marginHorizontal: SPACING.xl, backgroundColor: COLORS.surface2, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.base, paddingHorizontal: SPACING.md },
  searchIcon: { marginRight: SPACING.sm },
  searchInput: { flex: 1, height: 44, color: COLORS.textPrimary, fontFamily: FONTS.regular, fontSize: SIZES.md },
  chip: { paddingHorizontal: SPACING.md, paddingVertical: 7, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border, marginRight: SPACING.sm, backgroundColor: COLORS.surface },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontFamily: FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.bg },
  card: { marginBottom: SPACING.md, borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  cardGrad: { padding: SPACING.base },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.sm },
  typeDot: { width: 8, height: 8, borderRadius: 4 },
  cardMeta: { flexDirection: 'row', gap: SPACING.lg },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
});
