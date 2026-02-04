import { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, useColorScheme } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
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

function AnimatedProgressBar({ percent }: { percent: number }) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(300, withTiming(percent, { duration: 800 }));
  }, [percent]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value}%` as `${number}%`,
  }));

  return (
    <View style={styles.progressBarBg}>
      <Animated.View style={[styles.progressBarFill, fillStyle]} />
    </View>
  );
}

function ActiveWorldBorder({ children }: { children: React.ReactNode }) {
  const borderOpacity = useSharedValue(0.35);

  useEffect(() => {
    borderOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1500 }),
        withTiming(0.35, { duration: 1500 }),
      ),
      -1,
      true,
    );
  }, []);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(108, 92, 231, ${borderOpacity.value})`,
    borderWidth: 1.5,
    borderRadius: 16,
  }));

  return (
    <Animated.View style={borderStyle}>
      {children}
    </Animated.View>
  );
}

function AnimatedConnectionLine({
  isActiveConnection,
  delay,
  colors,
}: {
  isActiveConnection: boolean;
  delay: number;
  colors: typeof Colors.dark;
}) {
  const fillProgress = useSharedValue(0);

  useEffect(() => {
    if (isActiveConnection) {
      fillProgress.value = withDelay(delay, withTiming(1, { duration: 600 }));
    }
  }, [isActiveConnection]);

  const topDotStyle = useAnimatedStyle(() => {
    if (!isActiveConnection) return { backgroundColor: colors.border };
    const r = Math.round(55 + (108 - 55) * fillProgress.value);
    const g = Math.round(65 + (92 - 65) * fillProgress.value);
    const b = Math.round(81 + (231 - 81) * fillProgress.value);
    return { backgroundColor: `rgb(${r}, ${g}, ${b})` };
  });

  const barStyle = useAnimatedStyle(() => {
    if (!isActiveConnection) return { backgroundColor: colors.border };
    const r = Math.round(55 + (108 - 55) * fillProgress.value);
    const g = Math.round(65 + (92 - 65) * fillProgress.value);
    const b = Math.round(81 + (231 - 81) * fillProgress.value);
    return { backgroundColor: `rgba(${r}, ${g}, ${b}, 0.5)` };
  });

  return (
    <View style={styles.connectionLine}>
      <Animated.View style={[styles.connectionDot, topDotStyle]} />
      <Animated.View style={[styles.connectionBar, barStyle]} />
      <Animated.View style={[styles.connectionDot, { backgroundColor: colors.border }]} />
    </View>
  );
}

function LockedWorldCard({
  world,
  index,
  delay,
  colors,
}: {
  world: LockedWorld;
  index: number;
  delay: number;
  colors: typeof Colors.dark;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(0.6, { duration: 400 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 400 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <View
        style={[
          styles.worldCard,
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
    </Animated.View>
  );
}

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

      {/* World 1 - Available with pulsing border */}
      <ActiveWorldBorder>
        <Pressable
          style={[styles.worldCard, { backgroundColor: colors.card, borderWidth: 0 }]}
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
          <AnimatedProgressBar percent={world1.completionPercent} />
          <Text style={[styles.levelCount, { color: colors.subtle }]}>
            {world1.levels.filter((l) => l.status === 'completed').length}/{world1.levels.length} levels
          </Text>
        </Pressable>
      </ActiveWorldBorder>

      {/* Animated connection from World 1 */}
      <AnimatedConnectionLine
        isActiveConnection
        delay={800}
        colors={colors}
      />

      {/* Locked Worlds 2-7 with staggered fade-in */}
      {LOCKED_WORLDS.map((world, index) => (
        <View key={world.id}>
          <LockedWorldCard
            world={world}
            index={index}
            delay={400 + index * 120}
            colors={colors}
          />
          {index < LOCKED_WORLDS.length - 1 && (
            <AnimatedConnectionLine
              isActiveConnection={false}
              delay={0}
              colors={colors}
            />
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
    overflow: 'hidden',
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
