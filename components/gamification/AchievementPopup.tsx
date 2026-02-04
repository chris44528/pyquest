import { useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useAchievementNotificationStore } from '@/stores/achievementNotificationStore';
import { triggerHaptic } from '@/lib/haptics';
import Colors from '@/constants/Colors';

export function AchievementPopup() {
  const queue = useAchievementNotificationStore((s) => s.queue);
  const dismiss = useAchievementNotificationStore((s) => s.dismiss);

  const current = queue[0] ?? null;

  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  const handleDismiss = useCallback(() => {
    translateY.value = withTiming(-120, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 });
    setTimeout(() => dismiss(), 250);
  }, [dismiss]);

  useEffect(() => {
    if (current) {
      triggerHaptic('success');
      translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });

      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [current?.id]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!current) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable style={styles.card} onPress={handleDismiss}>
        <Text style={styles.icon}>{current.icon}</Text>
        <View style={styles.info}>
          <Text style={styles.label}>Achievement Unlocked!</Text>
          <Text style={styles.name}>{current.name}</Text>
          <Text style={styles.description}>{current.description}</Text>
        </View>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>+50 XP</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.brand.accent + '40',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 32,
  },
  info: {
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
    marginTop: 2,
  },
  xpBadge: {
    backgroundColor: Colors.brand.xp + '20',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  xpText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.brand.xp,
  },
});
