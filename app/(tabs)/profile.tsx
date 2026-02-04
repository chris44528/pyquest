import { StyleSheet, View, Text, ScrollView, useColorScheme } from 'react-native';
import { useProgressStore } from '@/stores/progressStore';
import { XPCounter } from '@/components/gamification/XPCounter';
import { StreakBadge } from '@/components/gamification/StreakBadge';
import { isStreakAtRisk } from '@/lib/streakUtils';
import Colors from '@/constants/Colors';
import type { AchievementDefinition } from '@/types/achievements';
import achievementsData from '@/content/achievements.json';

const allAchievements = achievementsData as AchievementDefinition[];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const totalXP = useProgressStore((s) => s.totalXP);
  const streak = useProgressStore((s) => s.streak);
  const achievements = useProgressStore((s) => s.achievements);
  const levelProgress = useProgressStore((s) => s.levelProgress);

  const levelsCompleted = Object.values(levelProgress).filter(
    (lp) => lp.status === 'completed'
  ).length;

  const unlockedIds = new Set(achievements.map((a) => a.id));

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.icon]}>{'\uD83E\uDD16'}</Text>
        <Text style={[styles.title, { color: colors.text }]}>Your Profile</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <XPCounter value={totalXP} size="medium" showIcon />
          <Text style={[styles.statLabel, { color: colors.subtle }]}>Total XP</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <StreakBadge
            current={streak.current}
            atRisk={isStreakAtRisk(streak.lastActivityDate)}
            size="medium"
          />
          <Text style={[styles.statLabel, { color: colors.subtle }]}>Day Streak</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.statEmoji}>{'\uD83C\uDFC6'}</Text>
          <Text style={[styles.statNumber, { color: Colors.brand.secondary }]}>{levelsCompleted}</Text>
          <Text style={[styles.statLabel, { color: colors.subtle }]}>Levels Done</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.statEmoji}>{'\uD83C\uDFC5'}</Text>
          <Text style={[styles.statNumber, { color: Colors.brand.accent }]}>{achievements.length}</Text>
          <Text style={[styles.statLabel, { color: colors.subtle }]}>Achievements</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Longest Streak</Text>
        <Text style={[styles.sectionValue, { color: colors.text }]}>
          {streak.longest} day{streak.longest !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Achievements ({achievements.length}/{allAchievements.filter((a) => !a.secret).length})
        </Text>
        <View style={styles.achievementsGrid}>
          {allAchievements
            .filter((a) => !a.secret || unlockedIds.has(a.id))
            .map((a) => {
              const unlocked = unlockedIds.has(a.id);
              return (
                <View
                  key={a.id}
                  style={[
                    styles.achievementItem,
                    { backgroundColor: unlocked ? Colors.brand.accent + '15' : colors.border + '30' },
                  ]}
                >
                  <Text style={[styles.achievementIcon, !unlocked && styles.achievementLocked]}>
                    {a.icon}
                  </Text>
                  <Text
                    style={[styles.achievementName, { color: unlocked ? colors.text : colors.subtle }]}
                    numberOfLines={1}
                  >
                    {a.name}
                  </Text>
                  <Text
                    style={[styles.achievementDesc, { color: colors.subtle }]}
                    numberOfLines={2}
                  >
                    {a.description}
                  </Text>
                </View>
              );
            })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  achievementItem: {
    width: '47%' as unknown as number,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  achievementIcon: {
    fontSize: 28,
  },
  achievementLocked: {
    opacity: 0.3,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  achievementDesc: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
  },
});
