import { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import type { StarRating as StarRatingType } from '@/types/progression';
import { triggerHaptic } from '@/lib/haptics';

interface StarRatingProps {
  stars: StarRatingType;
  animated?: boolean;
  size?: 'small' | 'medium' | 'large';
  onStarLand?: () => void;
}

const SIZE_MAP = {
  small: 14,
  medium: 24,
  large: 36,
};

const GAP_MAP = {
  small: 2,
  medium: 4,
  large: 8,
};

function AnimatedStar({
  earned,
  delay,
  fontSize,
  onLand,
}: {
  earned: boolean;
  delay: number;
  fontSize: number;
  onLand?: () => void;
}) {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(-30);

  useEffect(() => {
    if (earned) {
      scale.value = withDelay(
        delay,
        withSequence(
          withSpring(1.3, { damping: 8, stiffness: 200 }),
          withSpring(1.0, { damping: 12, stiffness: 150 }),
        ),
      );
      rotation.value = withDelay(
        delay,
        withSequence(
          withSpring(15, { damping: 8, stiffness: 200 }),
          withSpring(0, { damping: 12, stiffness: 150 }),
        ),
      );
      // Fire haptic when star would land
      const timer = setTimeout(() => {
        triggerHaptic('light');
        onLand?.();
      }, delay + 200);
      return () => clearTimeout(timer);
    } else {
      scale.value = withDelay(delay, withSpring(1.0, { damping: 12 }));
      rotation.value = 0;
    }
  }, [earned, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: earned ? 1 : 0.3,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text style={{ fontSize }}>{'\u2B50'}</Text>
    </Animated.View>
  );
}

export function StarRating({ stars, animated = false, size = 'medium', onStarLand }: StarRatingProps) {
  const fontSize = SIZE_MAP[size];
  const gap = GAP_MAP[size];

  if (!animated) {
    return (
      <View style={[styles.row, { gap }]}>
        {[1, 2, 3].map((s) => (
          <Text
            key={s}
            style={[{ fontSize }, s <= stars ? styles.earned : styles.empty]}
          >
            {'\u2B50'}
          </Text>
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.row, { gap }]}>
      {[1, 2, 3].map((s) => (
        <AnimatedStar
          key={s}
          earned={s <= stars}
          delay={(s - 1) * 300}
          fontSize={fontSize}
          onLand={s <= stars ? onStarLand : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earned: {
    opacity: 1,
  },
  empty: {
    opacity: 0.3,
  },
});
