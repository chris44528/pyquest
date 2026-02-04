import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';

interface StreakBadgeProps {
  current: number;
  atRisk?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const SIZE_MAP = {
  small: { fontSize: 14, iconSize: 16, paddingH: 10, paddingV: 4 },
  medium: { fontSize: 16, iconSize: 18, paddingH: 12, paddingV: 6 },
  large: { fontSize: 20, iconSize: 24, paddingH: 16, paddingV: 8 },
};

export function StreakBadge({ current, atRisk = false, size = 'medium' }: StreakBadgeProps) {
  const sizes = SIZE_MAP[size];
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    if (atRisk) {
      pulseOpacity.value = withRepeat(
        withTiming(0.5, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      pulseOpacity.value = 1;
    }
  }, [atRisk]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.badge,
        {
          paddingHorizontal: sizes.paddingH,
          paddingVertical: sizes.paddingV,
          backgroundColor: Colors.brand.streak + '20',
        },
        atRisk && styles.atRiskBadge,
        animatedStyle,
      ]}
    >
      <Text style={{ fontSize: sizes.iconSize }}>{'\uD83D\uDD25'}</Text>
      <Text style={[styles.text, { fontSize: sizes.fontSize, color: Colors.brand.streak }]}>
        {current} day{current !== 1 ? 's' : ''}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    gap: 6,
  },
  atRiskBadge: {
    borderWidth: 1,
    borderColor: Colors.brand.streak + '40',
  },
  text: {
    fontWeight: '700',
  },
});
