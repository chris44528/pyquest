import { useEffect, useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';

interface XPCounterProps {
  value: number;
  gained?: number;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

const SIZE_MAP = {
  small: { fontSize: 14, iconSize: 16, gainedSize: 14 },
  medium: { fontSize: 20, iconSize: 20, gainedSize: 16 },
  large: { fontSize: 28, iconSize: 28, gainedSize: 20 },
};

function FloatingXP({ gained, size }: { gained: number; size: number }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withTiming(-60, { duration: 800 });
    opacity.value = withDelay(400, withTiming(0, { duration: 400 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.floatingContainer, animatedStyle]}>
      <Text style={[styles.floatingText, { fontSize: size }]}>
        +{gained} XP
      </Text>
    </Animated.View>
  );
}

export function XPCounter({ value, gained, size = 'medium', showIcon = false }: XPCounterProps) {
  const sizes = SIZE_MAP[size];
  const displayValue = useSharedValue(value - (gained ?? 0));

  useEffect(() => {
    displayValue.value = withTiming(value, { duration: 500 });
  }, [value]);

  // We need to track display value in JS for rendering
  const [displayNum] = useAnimatedCounter(displayValue, value);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {showIcon && (
          <Text style={{ fontSize: sizes.iconSize }}>{'\u2B50'}</Text>
        )}
        <Text style={[styles.value, { fontSize: sizes.fontSize, color: Colors.brand.xp }]}>
          {displayNum} XP
        </Text>
      </View>
      {gained != null && gained > 0 && (
        <FloatingXP gained={gained} size={sizes.gainedSize} />
      )}
    </View>
  );
}

function useAnimatedCounter(
  _sharedValue: unknown,
  targetValue: number,
): [number, (v: number) => void] {
  const [display, setDisplay] = React.useState(targetValue);
  const prevRef = useRef(targetValue);

  useEffect(() => {
    // Animate from previous to new target
    const prev = prevRef.current;
    prevRef.current = targetValue;

    if (prev === targetValue) {
      setDisplay(targetValue);
      return;
    }

    const duration = 500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(prev + (targetValue - prev) * eased);
      setDisplay(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [targetValue]);

  return [display, setDisplay];
}

import React from 'react';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    fontWeight: '800',
  },
  floatingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  floatingText: {
    color: Colors.brand.xp,
    fontWeight: '800',
  },
});
