import { StyleSheet, View, Text, ScrollView, Pressable, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useWorld } from '@/hooks/useWorld';
import Colors from '@/constants/Colors';

interface LockedWorld {
  id: string;
  name: string;
  description: string;
  icon: string;
  theme: { primaryColor: string };
}

const LOCKED_WORLDS: LockedWorld[] = [
  { id: 'world2', name: 'Control Flow', description: 'Master if/else, loops, and logic', icon: '\uD83D\uDD00', theme: { primaryColor: '#00cec9' } },
  { id: 'world3', name: 'Data Structures', description: 'Lists, dictionaries, tuples, and sets', icon: '\uD83D\uDCE6', theme: { primaryColor: '#e17055' } },
  { id: 'world4', name: 'Functions', description: 'Define, call, and compose functions', icon: '\u2699\uFE0F', theme: { primaryColor: '#00b894' } },
  { id: 'world5', name: 'Working with Data', description: 'JSON, comprehensions, error handling', icon: '\uD83D\uDCCA', theme: { primaryColor: '#fdcb6e' } },
  { id: 'world6', name: 'OOP', description: 'Classes, inheritance, and methods', icon: '\uD83C\uDFD7\uFE0F', theme: { primaryColor: '#e84393' } },
  { id: 'world7', name: 'Practical Python', description: 'Modules, regex, and real-world projects', icon: '\uD83D\uDE80', theme: { primaryColor: '#0984e3' } },
];

export default function WorldsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();
  const world1 = useWorld('world1');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.heading, { color: colors.text }]}>World Map</Text>
      <Text style={[styles.subheading, { color: colors.subtle }]}>
        7 worlds, 70 levels of Python mastery
      </Text>

      {/* World 1 - Available */}
      <Pressable
        style={[styles.worldCard, { backgroundColor: colors.card, borderColor: Colors.brand.primary + '60' }]}
        onPress={() => router.push('/world/world1')}
      >
        <View style={styles.worldCardHeader}>
          <Text style={styles.worldIcon}>{world1.meta?.icon ?? '\uD83D\uDC0D'}</Text>
          <View style={styles.worldCardTitleArea}>
            <Text style={[styles.worldLabel, { color: Colors.brand.primaryLight }]}>World 1</Text>
            <Text style={[styles.worldName, { color: colors.text }]}>
              {world1.meta?.name ?? 'Python Basics'}
            </Text>
          </View>
          <View style={[styles.percentBadge, { backgroundColor: Colors.brand.primary + '25' }]}>
            <Text style={[styles.percentText, { color: Colors.brand.primaryLight }]}>
              {world1.completionPercent}%
            </Text>
          </View>
        </View>
        <Text style={[styles.worldDescription, { color: colors.subtle }]}>
          {world1.meta?.description ?? 'Start your Python journey!'}
        </Text>
        <View style={styles.progressBarBg}>
          <View
            style={[styles.progressBarFill, { width: `${world1.completionPercent}%` }]}
          />
        </View>
        <Text style={[styles.levelCount, { color: colors.subtle }]}>
          {world1.levels.filter((l) => l.status === 'completed').length}/{world1.levels.length} levels
        </Text>
      </Pressable>

      {/* Connection line */}
      <View style={styles.connectionLine}>
        <View style={[styles.connectionDot, { backgroundColor: Colors.brand.primary }]} />
        <View style={[styles.connectionBar, { backgroundColor: colors.border }]} />
        <View style={[styles.connectionDot, { backgroundColor: colors.border }]} />
      </View>

      {/* Locked Worlds 2-7 */}
      {LOCKED_WORLDS.map((world, index) => (
        <View key={world.id}>
          <View
            style={[
              styles.worldCard,
              styles.lockedCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.worldCardHeader}>
              <Text style={[styles.worldIcon, styles.lockedIcon]}>{world.icon}</Text>
              <View style={styles.worldCardTitleArea}>
                <Text style={[styles.worldLabel, { color: colors.subtle }]}>
                  World {index + 2}
                </Text>
                <Text style={[styles.worldName, { color: colors.subtle }]}>
                  {world.name}
                </Text>
              </View>
              <View style={[styles.lockBadge, { backgroundColor: colors.border + '40' }]}>
                <Text style={styles.lockIcon}>{'\uD83D\uDD12'}</Text>
              </View>
            </View>
            <Text style={[styles.worldDescription, { color: colors.subtle, opacity: 0.7 }]}>
              {world.description}
            </Text>
          </View>
          {index < LOCKED_WORLDS.length - 1 && (
            <View style={styles.connectionLine}>
              <View style={[styles.connectionDot, { backgroundColor: colors.border }]} />
              <View style={[styles.connectionBar, { backgroundColor: colors.border }]} />
              <View style={[styles.connectionDot, { backgroundColor: colors.border }]} />
            </View>
          )}
        </View>
      ))}
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
  heading: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    marginBottom: 20,
  },
  worldCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
  },
  lockedCard: {
    opacity: 0.6,
  },
  worldCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  worldIcon: {
    fontSize: 32,
  },
  lockedIcon: {
    opacity: 0.5,
  },
  worldCardTitleArea: {
    flex: 1,
  },
  worldLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  worldName: {
    fontSize: 20,
    fontWeight: '700',
  },
  percentBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  percentText: {
    fontSize: 14,
    fontWeight: '700',
  },
  lockBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lockIcon: {
    fontSize: 16,
  },
  worldDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: Colors.brand.primary,
    borderRadius: 3,
  },
  levelCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  connectionLine: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionBar: {
    width: 2,
    height: 20,
  },
});
