import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';

interface ComboBadgeProps {
  combo: number;
}

export function ComboBadge({ combo }: ComboBadgeProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (combo > 1) {
      opacity.value = withTiming(1, { duration: 150 });
      scale.value = withSequence(
        withSpring(1.3, { damping: 6, stiffness: 300 }),
        withSpring(1, { damping: 10, stiffness: 150 }),
      );
    } else {
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [combo]);

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (combo <= 1) return null;

  const cappedCombo = Math.min(combo, 5);

  return (
    <Animated.View style={[styles.badge, badgeStyle]}>
      <Text style={styles.comboText}>x{cappedCombo} Combo!</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: Colors.brand.accent,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'center',
  },
  comboText: {
    color: '#1a1a2e',
    fontSize: 14,
    fontWeight: '800',
  },
});
