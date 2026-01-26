import { StyleSheet, View, Text, useColorScheme } from 'react-native';
import { useProgressStore } from '@/stores/progressStore';
import Colors from '@/constants/Colors';

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.icon]}>&#129302;</Text>
        <Text style={[styles.title, { color: colors.text }]}>Your Profile</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.statEmoji}>&#11088;</Text>
          <Text style={[styles.statNumber, { color: Colors.brand.xp }]}>{totalXP}</Text>
          <Text style={[styles.statLabel, { color: colors.subtle }]}>Total XP</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.statEmoji}>&#128293;</Text>
          <Text style={[styles.statNumber, { color: Colors.brand.streak }]}>{streak.current}</Text>
          <Text style={[styles.statLabel, { color: colors.subtle }]}>Day Streak</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.statEmoji}>&#127942;</Text>
          <Text style={[styles.statNumber, { color: Colors.brand.secondary }]}>{levelsCompleted}</Text>
          <Text style={[styles.statLabel, { color: colors.subtle }]}>Levels Done</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.statEmoji}>&#127941;</Text>
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
    </View>
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
});
