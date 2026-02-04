import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { playSound } from '@/lib/sounds';
import { celebrationHaptic } from '@/lib/haptics';
import Colors from '@/constants/Colors';
import type { Achievement } from '@/types/progression';

interface AchievementToastProps {
  achievement: Achievement;
  onDismiss: () => void;
}

export function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    celebrationHaptic();
    playSound('achievementUnlock');

    translateY.value = withSpring(0, { damping: 12, stiffness: 150 });
    opacity.value = withTiming(1, { duration: 200 });
    scale.value = withSpring(1, { damping: 10, stiffness: 120 });

    // Auto-dismiss after 3 seconds
    const timeout = setTimeout(() => {
      translateY.value = withTiming(-120, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
      setTimeout(onDismiss, 350);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.icon}>{achievement.icon}</Text>
      <View style={styles.textContainer}>
        <Text style={styles.label}>Achievement Unlocked!</Text>
        <Text style={styles.name}>{achievement.name}</Text>
        <Text style={styles.description}>{achievement.description}</Text>
      </View>
      <Text style={styles.xp}>+50 XP</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.brand.accent + '40',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  icon: {
    fontSize: 32,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.brand.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8f9fa',
    marginTop: 2,
  },
  description: {
    fontSize: 12,
    color: Colors.dark.subtle,
    marginTop: 1,
  },
  xp: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.brand.xp,
  },
});
