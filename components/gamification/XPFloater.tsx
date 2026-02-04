import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';

interface XPFloaterProps {
  amount: number;
  visible: boolean;
}

export function XPFloater({ amount, visible }: XPFloaterProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    if (visible) {
      translateY.value = 0;
      opacity.value = 0;
      scale.value = 0.5;

      opacity.value = withTiming(1, { duration: 150 });
      scale.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.back(1.5)) });
      translateY.value = withTiming(-50, { duration: 800, easing: Easing.out(Easing.cubic) });
      opacity.value = withDelay(500, withTiming(0, { duration: 300 }));
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.Text style={[styles.text, animatedStyle]}>
      +{amount} XP
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: Colors.brand.xp,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
