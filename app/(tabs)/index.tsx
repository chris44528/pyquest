import { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePython } from '@/components/code/PythonRunner';
import { useProgressStore } from '@/stores/progressStore';
import { useWorld } from '@/hooks/useWorld';
import { getPlayerLevel } from '@/lib/playerLevel';
import Colors from '@/constants/Colors';

function StreakMessage({ days }: { days: number }) {
  if (days === 0) return <Text style={styles.streakMsg}>Start your streak today!</Text>;
  if (days < 3) return <Text style={styles.streakMsg}>Keep it going!</Text>;
  if (days < 7) return <Text style={styles.streakMsg}>You're on fire!</Text>;
  if (days < 14) return <Text style={styles.streakMsg}>Incredible dedication!</Text>;
  return <Text style={styles.streakMsg}>Unstoppable!</Text>;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();
  const { runCode, isReady, isRunning } = usePython();
  const totalXP = useProgressStore((s) => s.totalXP);
  const streak = useProgressStore((s) => s.streak);
  const achievements = useProgressStore((s) => s.achievements);
  const world1 = useWorld('world1');

  const playerLevel = useMemo(() => getPlayerLevel(totalXP), [totalXP]);
  const recentAchievements = useMemo(
    () => [...achievements].reverse().slice(0, 3),
    [achievements],
  );

  const nextLevel = useMemo(() => {
    const inProgress = world1.levels.find((l) => l.status === 'in_progress');
    if (inProgress) return inProgress;
    const available = world1.levels.find((l) => l.status === 'available');
    return available ?? world1.levels[0] ?? null;
  }, [world1.levels]);

  // Sandbox state
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const [code, setCode] = useState('print("Hello, PyQuest!")');
  const [output, setOutput] = useState('');

  const handleRun = async () => {
    if (!isReady || isRunning) return;
    setOutput('Running...');
    const result = await runCode(code);
    if (result.success) {
      setOutput(result.stdout || '(no output)');
    } else {
      setOutput(`Error: ${result.error}`);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Player Level Header */}
      <View style={styles.header}>
        <View style={styles.levelRow}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelNumber}>{playerLevel.level}</Text>
          </View>
          <View style={styles.levelInfo}>
            <Text style={[styles.playerTitle, { color: colors.text }]}>
              {playerLevel.title}
            </Text>
            <Text style={[styles.xpText, { color: Colors.brand.xp }]}>
              {totalXP} XP
            </Text>
          </View>
        </View>

        {/* XP Progress Bar */}
        {!playerLevel.isMaxLevel && (
          <View style={styles.xpBarContainer}>
            <View style={styles.xpBarBg}>
              <View
                style={[
                  styles.xpBarFill,
                  { width: `${Math.round(playerLevel.xpProgress * 100)}%` },
                ]}
              />
            </View>
            <Text style={[styles.xpBarLabel, { color: colors.subtle }]}>
              {playerLevel.xpForNext - totalXP} XP to Level {playerLevel.level + 1}
            </Text>
          </View>
        )}
      </View>

      {/* Streak Section */}
      <View style={[styles.streakCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.streakTop}>
          <Text style={styles.streakFire}>
            {streak.current >= 7 ? '\U0001F525\U0001F525\U0001F525' : streak.current >= 3 ? '\U0001F525\U0001F525' : '\U0001F525'}
          </Text>
          <View>
            <Text style={[styles.streakCount, { color: Colors.brand.streak }]}>
              {streak.current} day{streak.current !== 1 ? 's' : ''}
            </Text>
            <StreakMessage days={streak.current} />
          </View>
        </View>
        {streak.longest > 0 && (
          <Text style={[styles.streakBest, { color: colors.subtle }]}>
            Best: {streak.longest} day{streak.longest !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {/* Continue Learning Card */}
      {nextLevel && (
        <Pressable
          style={[styles.card, styles.levelCard, { backgroundColor: colors.card, borderColor: Colors.brand.primary + '40' }]}
          onPress={() => router.push(`/world/world1/level/${nextLevel.id}`)}
        >
          <View style={styles.levelCardHeader}>
            <Text style={styles.levelCardIcon}>{'\uD83D\uDC0D'}</Text>
            <View style={styles.levelCardBadge}>
              <Text style={styles.levelCardBadgeText}>World 1</Text>
            </View>
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {nextLevel.title}
          </Text>
          <Text style={[styles.cardSubtitle, { color: colors.subtle, marginBottom: 0 }]}>
            {nextLevel.concept}
          </Text>
          <View style={styles.levelCardArrow}>
            <Text style={styles.levelCardArrowText}>
              {nextLevel.status === 'in_progress' ? 'Continue' : 'Start'} {'\u2192'}
            </Text>
          </View>
        </Pressable>
      )}

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Achievements
          </Text>
          <View style={styles.achievementList}>
            {recentAchievements.map((a) => (
              <View key={a.id} style={styles.achievementRow}>
                <Text style={styles.achievementIcon}>{a.icon}</Text>
                <View style={styles.achievementInfo}>
                  <Text style={[styles.achievementName, { color: colors.text }]}>
                    {a.name}
                  </Text>
                  <Text style={[styles.achievementDesc, { color: colors.subtle }]}>
                    {a.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Collapsible Python Sandbox */}
      <Pressable
        style={[styles.sandboxToggle, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => setSandboxOpen(!sandboxOpen)}
      >
        <Text style={[styles.sandboxToggleText, { color: colors.text }]}>
          {'\U0001F9EA'} Python Sandbox
        </Text>
        <Text style={[styles.sandboxArrow, { color: colors.subtle }]}>
          {sandboxOpen ? '\u25B2' : '\u25BC'}
        </Text>
      </Pressable>

      {sandboxOpen && (
        <View style={[styles.card, styles.sandboxCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardSubtitle, { color: colors.subtle }]}>
            {isReady ? 'Python is ready! Write some code below.' : 'Loading Python runtime...'}
          </Text>

          <TextInput
            style={[
              styles.codeInput,
              {
                color: colors.text,
                backgroundColor: colorScheme === 'dark' ? '#0f0f23' : '#f1f3f5',
                borderColor: colors.border,
              },
            ]}
            value={code}
            onChangeText={setCode}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            placeholder="Write Python code here..."
            placeholderTextColor={colors.subtle}
          />

          <Pressable
            style={[
              styles.runButton,
              {
                backgroundColor: isReady && !isRunning ? Colors.brand.primary : colors.subtle,
              },
            ]}
            onPress={handleRun}
            disabled={!isReady || isRunning}
          >
            <Text style={styles.runButtonText}>
              {isRunning ? 'Running...' : '\u25B6 Run Code'}
            </Text>
          </Pressable>

          {output !== '' && (
            <View
              style={[
                styles.outputContainer,
                {
                  backgroundColor: colorScheme === 'dark' ? '#0f0f23' : '#f1f3f5',
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.outputLabel, { color: colors.subtle }]}>Output:</Text>
              <Text style={[styles.outputText, { color: colors.text }]}>{output}</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.brand.primaryLight,
  },
  levelNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  levelInfo: {
    flex: 1,
  },
  playerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  xpText: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  xpBarContainer: {
    gap: 4,
  },
  xpBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brand.xp + '20',
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
  },
  // Streak
  streakCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  streakTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakFire: {
    fontSize: 28,
  },
  streakCount: {
    fontSize: 20,
    fontWeight: '800',
  },
  streakMsg: {
    fontSize: 13,
    color: Colors.dark.subtle,
    marginTop: 2,
  },
  streakBest: {
    fontSize: 12,
    marginTop: 8,
  },
  // Cards
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  // Level card
  levelCard: {
    borderWidth: 1.5,
  },
  levelCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  levelCardIcon: {
    fontSize: 24,
  },
  levelCardBadge: {
    backgroundColor: Colors.brand.primary + '25',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  levelCardBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.brand.primaryLight,
  },
  levelCardArrow: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: Colors.brand.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  levelCardArrowText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  // Achievements
  achievementList: {
    gap: 10,
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achievementIcon: {
    fontSize: 28,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '700',
  },
  achievementDesc: {
    fontSize: 12,
    marginTop: 1,
  },
  // Sandbox
  sandboxToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    marginBottom: 4,
    borderWidth: 1,
  },
  sandboxToggleText: {
    fontSize: 16,
    fontWeight: '700',
  },
  sandboxArrow: {
    fontSize: 12,
  },
  sandboxCard: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginTop: 0,
  },
  codeInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    fontFamily: 'SpaceMono',
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    marginBottom: 12,
  },
  runButton: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  runButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  outputContainer: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  outputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  outputText: {
    fontSize: 14,
    fontFamily: 'SpaceMono',
    lineHeight: 20,
  },
});
