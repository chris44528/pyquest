import { useEffect, useState } from 'react';
import { Text, type TextStyle } from 'react-native';
import {
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';

interface AnimatedCounterProps {
  to: number;
  from?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  style?: TextStyle;
}

export function AnimatedCounter({
  to,
  from = 0,
  duration = 1200,
  prefix = '',
  suffix = '',
  style,
}: AnimatedCounterProps) {
  const animatedValue = useSharedValue(from);
  const [displayValue, setDisplayValue] = useState(from);

  useAnimatedReaction(
    () => Math.round(animatedValue.value),
    (current, previous) => {
      if (current !== previous) {
        runOnJS(setDisplayValue)(current);
      }
    },
  );

  useEffect(() => {
    animatedValue.value = withTiming(to, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [to]);

  return (
    <Text style={style}>
      {prefix}{displayValue}{suffix}
    </Text>
  );
}
