import { useEffect, useMemo } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';

const PARTICLE_COUNT = 30;
const PARTICLE_SIZE = 8;
const DURATION = 1500;

const CONFETTI_COLORS = [
  Colors.brand.primary,
  Colors.brand.primaryLight,
  Colors.brand.secondary,
  Colors.brand.accent,
  Colors.brand.xp,
  '#e17055',
  '#fd79a8',
  '#00b894',
];

interface ParticleConfig {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  rotation: number;
  color: string;
  delay: number;
}

function Particle({ config }: { config: ParticleConfig }) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    progress.value = withDelay(
      config.delay,
      withTiming(1, { duration: DURATION, easing: Easing.out(Easing.cubic) }),
    );
    opacity.value = withDelay(
      config.delay + DURATION * 0.6,
      withTiming(0, { duration: DURATION * 0.4 }),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX:
          config.startX + (config.endX - config.startX) * progress.value,
      },
      {
        translateY:
          config.startY +
          (config.endY - config.startY) * progress.value +
          200 * progress.value * progress.value, // gravity
      },
      { rotate: `${config.rotation * progress.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        { backgroundColor: config.color },
        animatedStyle,
      ]}
    />
  );
}

export function ConfettiEffect() {
  const { width } = Dimensions.get('window');

  const particles = useMemo<ParticleConfig[]>(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      startX: width / 2 - PARTICLE_SIZE / 2,
      startY: -20,
      endX: Math.random() * width - PARTICLE_SIZE / 2,
      endY: -100 - Math.random() * 200,
      rotation: (Math.random() - 0.5) * 720,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 300,
    }));
  }, [width]);

  return (
    <>
      {particles.map((config, i) => (
        <Particle key={i} config={config} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    width: PARTICLE_SIZE,
    height: PARTICLE_SIZE,
    borderRadius: 2,
  },
});
