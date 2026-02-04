import { useEffect } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { ConfettiEffect } from './ConfettiEffect';
import { AnimatedCounter } from './AnimatedCounter';
import { celebrationHaptic } from '@/lib/haptics';
import { playSound } from '@/lib/sounds';
import Colors from '@/constants/Colors';
import type { StarRating } from '@/types/progression';

interface LevelCompleteProps {
  stars: StarRating;
  xpEarned: number;
  firstTryCount: number;
  totalExercises: number;
  hintsUsed: number;
  onBack: () => void;
}

function AnimatedStar({ earned, index }: { earned: boolean; index: number }) {
  const scale = useSharedValue(0);
  const rotate = useSharedValue(-30);

  useEffect(() => {
    scale.value = withDelay(
      400 + index * 250,
      withSpring(1, { damping: 8, stiffness: 150 }),
    );
    rotate.value = withDelay(
      400 + index * 250,
      withSpring(0, { damping: 10, stiffness: 120 }),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: earned ? 1 : 0.25,
  }));

  return (
    <Animated.Text style={[styles.star, style]}>
      {'\u2B50'}
    </Animated.Text>
  );
}

export function LevelComplete({
  stars,
  xpEarned,
  firstTryCount,
  totalExercises,
  hintsUsed,
  onBack,
}: LevelCompleteProps) {
  const titleScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    celebrationHaptic();
    playSound('levelComplete');
    titleScale.value = withDelay(
      200,
      withSpring(1, { damping: 8, stiffness: 120 }),
    );
    contentOpacity.value = withDelay(
      1200,
      withTiming(1, { duration: 400 }),
    );
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <ConfettiEffect />

      <Animated.Text style={[styles.emoji, titleStyle]}>
        {'\U0001F389'}
      </Animated.Text>
      <Animated.Text style={[styles.title, titleStyle]}>
        Level Complete!
      </Animated.Text>

      <View style={styles.starsRow}>
        {[1, 2, 3].map((starNum) => (
          <AnimatedStar
            key={starNum}
            earned={starNum <= stars}
            index={starNum - 1}
          />
        ))}
      </View>

      <Animated.View style={[styles.xpBox, contentStyle]}>
        <Text style={styles.xpLabel}>XP Earned</Text>
        <AnimatedCounter
          to={xpEarned}
          duration={1000}
          prefix="+"
          suffix=" XP"
          style={styles.xpValue}
        />
      </Animated.View>

      <Animated.View style={[styles.statsGrid, contentStyle]}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {firstTryCount}/{totalExercises}
          </Text>
          <Text style={styles.statLabel}>First Try</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{hintsUsed}</Text>
          <Text style={styles.statLabel}>Hints Used</Text>
        </View>
      </Animated.View>

      <Animated.View style={contentStyle}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back to Levels</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f8f9fa',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
  },
  star: {
    fontSize: 42,
  },
  xpBox: {
    backgroundColor: Colors.brand.xp + '20',
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 16,
    alignItems: 'center',
    minWidth: 160,
  },
  xpLabel: {
    fontSize: 13,
    color: Colors.brand.xp,
    fontWeight: '600',
    marginBottom: 4,
  },
  xpValue: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.brand.xp,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    maxWidth: 140,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8f9fa',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.subtle,
    marginTop: 4,
  },
  backButton: {
    backgroundColor: Colors.brand.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 200,
    marginTop: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
