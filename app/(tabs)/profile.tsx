import { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProgressStore } from '@/stores/progressStore';
import { getPlayerLevel } from '@/lib/playerLevel';
import Colors from '@/constants/Colors';
import type { AchievementDefinition } from '@/types/achievements';
import achievementsData from '@/content/achievements.json';

const allAchievements = achievementsData as AchievementDefinition[];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();

  const totalXP = useProgressStore((s) => s.totalXP);
  const streak = useProgressStore((s) => s.streak);
  const achievements = useProgressStore((s) => s.achievements);
  const levelProgress = useProgressStore((s) => s.levelProgress);

  const playerLevel = useMemo(() => getPlayerLevel(totalXP), [totalXP]);

  const levelsCompleted = useMemo(
    () => Object.values(levelProgress).filter((lp) => lp.status === 'completed').length,
    [levelProgress],
  );

  const totalStars = useMemo(
    () => Object.values(levelProgress).reduce((sum, lp) => sum + lp.stars, 0),
    [levelProgress],
  );

  const unlockedIds = useMemo(
    () => new Set(achievements.map((a) => a.id)),
    [achievements],
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Settings gear */}
      <Pressable
        style={styles.settingsButton}
        onPress={() => router.push('/settings')}
        hitSlop={12}
      >
        <Ionicons name="settings-outline" size={24} color={colors.subtle} />
      </Pressable>

      {/* Player Level Badge */}
      <View style={styles.levelSection}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelNumber}>{playerLevel.level}</Text>
        </View>
        <Text style={[styles.playerTitle, { color: colors.text }]}>
          {playerLevel.title}
        </Text>
        {!playerLevel.isMaxLevel && (
          <View style={styles.xpBarContainer}>
            <View style={[styles.xpBarBg, { backgroundColor: Colors.brand.xp + '20' }]}>
              <View
                style={[
                  styles.xpBarFill,
                  { width: `${Math.round(playerLevel.xpProgress * 100)}%` },
                ]}
              />
            </View>
            <Text style={[styles.xpBarLabel, { color: colors.subtle }]}>
              {totalXP} / {playerLevel.xpForNext} XP
            </Text>
          </View>
        )}
        {playerLevel.isMaxLevel && (
          <Text style={[styles.maxLevelText, { color: Colors.brand.xp }]}>
            MAX LEVEL — {totalXP} XP
          </Text>
        )}
      </View>

      {/* Stats Row */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statNumber, { color: Colors.brand.xp }]}>{totalXP}</Text>
          <Text style={[styles.statLabel, { color: colors.subtle }]}>Total XP</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statNumber, { color: Colors.brand.streak }]}>{streak.current}</Text>
          <Text style={[styles.statLabel, { color: colors.subtle }]}>Day Streak</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statNumber, { color: Colors.brand.secondary }]}>{levelsCompleted}</Text>
          <Text style={[styles.statLabel, { color: colors.subtle }]}>Levels Done</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statNumber, { color: Colors.brand.accent }]}>{totalStars}</Text>
          <Text style={[styles.statLabel, { color: colors.subtle }]}>Stars Earned</Text>
        </View>
      </View>

      {/* Best Streak */}
      {streak.longest > 0 && (
        <View style={[styles.bestStreakRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.bestStreakIcon}>{'\uD83D\uDD25'}</Text>
          <Text style={[styles.bestStreakLabel, { color: colors.subtle }]}>Best Streak</Text>
          <Text style={[styles.bestStreakValue, { color: Colors.brand.streak }]}>
            {streak.longest} day{streak.longest !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Achievement Gallery */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievements</Text>
      <View style={styles.achievementGrid}>
        {allAchievements.map((def) => {
          const unlocked = unlockedIds.has(def.id);
          return (
            <View
              key={def.id}
              style={[
                styles.achievementTile,
                {
                  backgroundColor: unlocked ? colors.card : colors.card,
                  borderColor: unlocked ? Colors.brand.primary + '40' : colors.border,
                  opacity: unlocked ? 1 : 0.5,
                },
              ]}
            >
              <Text style={styles.achievementIcon}>
                {unlocked ? def.icon : '\u2753'}
              </Text>
              <Text
                style={[
                  styles.achievementName,
                  { color: unlocked ? colors.text : colors.subtle },
                ]}
                numberOfLines={2}
              >
                {unlocked ? def.name : '???'}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  settingsButton: {
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  levelSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  levelBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.brand.primaryLight,
    marginBottom: 10,
  },
  levelNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
  },
  playerTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  xpBarContainer: {
    width: '80%',
    gap: 4,
  },
  xpBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Colors.brand.xp,
  },
  xpBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  maxLevelText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  bestStreakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  bestStreakIcon: {
    fontSize: 20,
  },
  bestStreakLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  bestStreakValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  achievementTile: {
    width: '30%',
    flexGrow: 1,
    minWidth: 100,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    gap: 6,
  },
  achievementIcon: {
    fontSize: 28,
  },
  achievementName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});
