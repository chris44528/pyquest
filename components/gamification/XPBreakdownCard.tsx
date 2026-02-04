import { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import type { XPBreakdown } from '@/lib/xpCalculator';
import Colors from '@/constants/Colors';

interface XPBreakdownCardProps {
  breakdown: XPBreakdown;
}

interface LineItemProps {
  label: string;
  value: number;
  delay: number;
  highlight?: boolean;
}

function LineItem({ label, value, delay, highlight }: LineItemProps) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
    translateX.value = withDelay(delay, withTiming(0, { duration: 300 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  if (value === 0) return null;

  return (
    <Animated.View style={[styles.lineItem, animatedStyle]}>
      <Text style={[styles.lineLabel, highlight && styles.highlightLabel]}>
        {label}
      </Text>
      <Text style={[styles.lineValue, highlight && styles.highlightValue]}>
        {highlight ? '' : '+'}{value}{highlight ? '' : ' XP'}
      </Text>
    </Animated.View>
  );
}

export function XPBreakdownCard({ breakdown }: XPBreakdownCardProps) {
  const showMultiplier = breakdown.streakMultiplier > 1;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>XP Earned</Text>
      <View style={styles.divider} />

      <LineItem label="Exercises" value={breakdown.exerciseXP} delay={0} />
      <LineItem label="No Hints Bonus" value={breakdown.noHintsBonus} delay={200} />
      <LineItem label="First Try Bonus" value={breakdown.firstTryBonus} delay={400} />
      <LineItem label="Level Bonus" value={breakdown.levelBonus} delay={600} />

      {showMultiplier && (
        <LineItem
          label={`Streak Multiplier (${breakdown.streakMultiplier}x)`}
          value={breakdown.streakMultiplier}
          delay={800}
          highlight
        />
      )}

      <View style={styles.divider} />
      <LineItem
        label="Total"
        value={breakdown.total}
        delay={showMultiplier ? 1000 : 800}
        highlight
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.brand.xp + '15',
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.brand.xp,
    textAlign: 'center',
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.brand.xp + '30',
    marginVertical: 4,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lineLabel: {
    fontSize: 14,
    color: '#e5e7eb',
  },
  lineValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.brand.xp,
  },
  highlightLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8f9fa',
  },
  highlightValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.brand.xp,
  },
});
