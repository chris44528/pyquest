import { useState } from 'react';
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
import Colors from '@/constants/Colors';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();
  const { runCode, isReady, isRunning } = usePython();
  const totalXP = useProgressStore((s) => s.totalXP);
  const streak = useProgressStore((s) => s.streak);

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
            <Text style={[styles.statIcon]}>&#11088;</Text>
            <Text style={[styles.statValue, { color: Colors.brand.xp }]}>{totalXP} XP</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: Colors.brand.streak + '20' }]}>
            <Text style={styles.statIcon}>&#128293;</Text>
            <Text style={[styles.statValue, { color: Colors.brand.streak }]}>
              {streak.current} day{streak.current !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
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

      <Pressable
        style={[styles.card, styles.levelCard, { backgroundColor: colors.card, borderColor: Colors.brand.primary + '40' }]}
        onPress={() => router.push('/world/world1/level/level1')}
      >
        <View style={styles.levelCardHeader}>
          <Text style={styles.levelCardIcon}>{'\U0001F40D'}</Text>
          <View style={styles.levelCardBadge}>
            <Text style={styles.levelCardBadgeText}>World 1</Text>
          </View>
        </View>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Hello, Python!
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.subtle, marginBottom: 0 }]}>
          Learn print() and strings — your first Python program
        </Text>
        <View style={styles.levelCardArrow}>
          <Text style={styles.levelCardArrowText}>Start Level 1 {'\u2192'}</Text>
        </View>
      </Pressable>
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
