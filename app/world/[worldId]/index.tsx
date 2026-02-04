import { useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useWorld, type LevelSummary } from '@/hooks/useWorld';
import { StarRating } from '@/components/gamification/StarRating';
import Colors from '@/constants/Colors';

function AnimatedLevelCard({
  item,
  index,
  worldId,
}: {
  item: LevelSummary;
  index: number;
  worldId: string;
}) {
  const router = useRouter();
  const isLocked = item.status === 'locked';
  const isCompleted = item.status === 'completed';
  const isAvailable = item.status === 'available' || item.status === 'in_progress';

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const glowOpacity = useSharedValue(0.3);
  const bossScale = useSharedValue(0.95);

  useEffect(() => {
    const delay = index * 80;
    opacity.value = withDelay(delay, withSpring(1, { damping: 15 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 12, stiffness: 120 }));

    if (isAvailable && !item.isBoss) {
      glowOpacity.value = withDelay(
        delay + 200,
        withRepeat(
          withSequence(
            withTiming(0.6, { duration: 1200 }),
            withTiming(0.3, { duration: 1200 }),
          ),
          -1,
          true,
        ),
      );
    }

    if (item.isBoss && !isLocked) {
      bossScale.value = withDelay(
        delay,
        withSequence(
          withSpring(1.02, { damping: 8, stiffness: 100 }),
          withSpring(1, { damping: 10 }),
        ),
      );
    }
  }, []);

  const cardAnimStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(108, 92, 231, ${glowOpacity.value})`,
  }));

  const bossAnimStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: bossScale.value }],
  }));

  if (item.isBoss) {
    return (
      <Animated.View style={bossAnimStyle}>
        <Pressable
          style={[
            styles.bossCard,
            isLocked && styles.lockedCard,
          ]}
          onPress={() => {
            if (!isLocked) router.push(`/world/${worldId}/level/${item.id}`);
          }}
          disabled={isLocked}
        >
          <View style={styles.bossHeader}>
            <Text style={styles.bossIcon}>{'\uD83D\uDC09'}</Text>
            <View style={styles.bossInfo}>
              <Text style={[styles.bossLabel, isLocked && styles.lockedText]}>
                BOSS LEVEL
              </Text>
              <Text style={[styles.bossTitle, isLocked && styles.lockedText]}>
                {item.title}
              </Text>
              <Text style={[styles.bossConcept, isLocked && styles.lockedText]}>
                {item.concept}
              </Text>
            </View>
            {isLocked && <Text style={styles.lockEmoji}>{'\uD83D\uDD12'}</Text>}
            {isCompleted && <StarRating stars={item.stars} size="small" />}
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[cardAnimStyle, isAvailable && glowStyle, { flex: 1 }]}>
      <Pressable
        style={[
          styles.levelCard,
          isLocked && styles.lockedCard,
          isCompleted && styles.completedCard,
          isAvailable && styles.availableCard,
        ]}
        onPress={() => {
          if (!isLocked) router.push(`/world/${worldId}/level/${item.id}`);
        }}
        disabled={isLocked}
      >
        <View style={[styles.levelNumber, isLocked && styles.levelNumberLocked]}>
          <Text style={[styles.levelNumberText, isLocked && styles.lockedText]}>
            {index + 1}
          </Text>
        </View>
        <Text
          style={[styles.levelTitle, isLocked && styles.lockedText]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text
          style={[styles.levelConcept, isLocked && styles.lockedText]}
          numberOfLines={1}
        >
          {item.concept}
        </Text>
        {isLocked && <Text style={styles.lockEmoji}>{'\uD83D\uDD12'}</Text>}
        {isCompleted && <StarRating stars={item.stars} size="small" />}
        {item.status === 'available' && (
          <View style={styles.availableDot} />
        )}
        {item.status === 'in_progress' && (
          <View style={styles.inProgressDot} />
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function WorldDetailScreen() {
  const { worldId } = useLocalSearchParams<{ worldId: string }>();
  const { meta, levels, completionPercent } = useWorld(worldId ?? '');

  if (!meta) {
    return (
      <>
        <Stack.Screen options={{ title: 'World' }} />
        <View style={styles.center}>
          <Text style={styles.errorText}>World not found</Text>
        </View>
      </>
    );
  }

  const regularLevels = levels.filter((l) => !l.isBoss);
  const bossLevel = levels.find((l) => l.isBoss);

  return (
    <>
      <Stack.Screen options={{ title: meta.name }} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>{meta.icon}</Text>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{meta.name}</Text>
            <Text style={styles.headerDesc}>{meta.description}</Text>
          </View>
        </View>
        <View style={styles.progressRow}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${completionPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>{completionPercent}%</Text>
        </View>

        {/* Level Grid */}
        <FlatList
          data={regularLevels}
          numColumns={2}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.gridContent}
          renderItem={({ item, index }) => (
            <AnimatedLevelCard item={item} index={index} worldId={worldId ?? ''} />
          )}
          ListFooterComponent={
            bossLevel ? (
              <AnimatedLevelCard
                item={bossLevel}
                index={levels.length - 1}
                worldId={worldId ?? ''}
              />
            ) : null
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  errorText: {
    color: Colors.dark.error,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerIcon: {
    fontSize: 40,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8f9fa',
  },
  headerDesc: {
    fontSize: 13,
    color: Colors.dark.subtle,
    lineHeight: 18,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: Colors.brand.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.brand.primaryLight,
  },
  gridContent: {
    padding: 12,
    paddingBottom: 40,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  levelCard: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 6,
  },
  completedCard: {
    borderColor: Colors.brand.primary + '50',
  },
  availableCard: {
    borderWidth: 1.5,
  },
  lockedCard: {
    opacity: 0.45,
  },
  levelNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.brand.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumberLocked: {
    backgroundColor: Colors.dark.border + '40',
  },
  levelNumberText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.brand.primaryLight,
  },
  levelTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8f9fa',
    textAlign: 'center',
  },
  levelConcept: {
    fontSize: 11,
    color: Colors.dark.subtle,
    textAlign: 'center',
  },
  lockedText: {
    color: Colors.dark.subtle,
  },
  lockEmoji: {
    fontSize: 16,
    marginTop: 2,
  },
  availableDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brand.primary,
    marginTop: 4,
  },
  inProgressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brand.accent,
    marginTop: 4,
  },
  bossCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    padding: 18,
    borderWidth: 2,
    borderColor: Colors.brand.accent + '60',
    marginTop: 4,
  },
  bossHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bossIcon: {
    fontSize: 36,
  },
  bossInfo: {
    flex: 1,
  },
  bossLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.brand.accent,
    letterSpacing: 1,
  },
  bossTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#f8f9fa',
  },
  bossConcept: {
    fontSize: 12,
    color: Colors.dark.subtle,
  },
});
