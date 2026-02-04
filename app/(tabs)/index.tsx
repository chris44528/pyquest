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
import { XPCounter } from '@/components/gamification/XPCounter';
import { StreakBadge } from '@/components/gamification/StreakBadge';
import { isStreakAtRisk } from '@/lib/streakUtils';
import Colors from '@/constants/Colors';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();
  const { runCode, isReady, isRunning } = usePython();
  const totalXP = useProgressStore((s) => s.totalXP);
  const streak = useProgressStore((s) => s.streak);
  const world1 = useWorld('world1');

  const nextLevel = useMemo(() => {
    // Find first in_progress or available level
    const inProgress = world1.levels.find((l) => l.status === 'in_progress');
    if (inProgress) return inProgress;
    const available = world1.levels.find((l) => l.status === 'available');
    return available ?? world1.levels[0] ?? null;
  }, [world1.levels]);

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
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.text }]}>
          Welcome to PyQuest!
        </Text>
        <View style={styles.statsRow}>
          <View style={[styles.statBadge, { backgroundColor: Colors.brand.xp + '20' }]}>
            <XPCounter value={totalXP} size="small" showIcon />
          </View>
          <StreakBadge
            current={streak.current}
            atRisk={isStreakAtRisk(streak.lastActivityDate)}
          />
        </View>
        {isStreakAtRisk(streak.lastActivityDate) && streak.current > 0 && (
          <View style={[styles.streakWarning, { backgroundColor: Colors.brand.streak + '15' }]}>
            <Text style={styles.streakWarningText}>
              {'\u26A0\uFE0F'} Complete a lesson today to keep your streak!
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Try Python
        </Text>
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
            {isRunning ? 'Running...' : 'Run Code'}
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
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statIcon: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  streakWarning: {
    marginTop: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  streakWarningText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.brand.streak,
  },
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
  codeInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
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
});
