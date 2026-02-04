import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const PARTICLE_COUNT = 30;
const COLORS = ['#6c5ce7', '#a29bfe', '#fdcb6e', '#f39c12', '#00cec9', '#e17055', '#34d399', '#f87171'];
const DURATION = 1500;

interface Particle {
  angle: number;
  distance: number;
  delay: number;
  color: string;
  size: number;
  rotation: number;
}

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    angle: Math.random() * Math.PI * 2,
    distance: 80 + Math.random() * 160,
    delay: Math.random() * 300,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 720 - 360,
  }));
}

function ParticleView({ particle }: { particle: Particle }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      particle.delay,
      withTiming(1, { duration: DURATION, easing: Easing.out(Easing.cubic) }),
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const p = progress.value;
    const x = Math.cos(particle.angle) * particle.distance * p;
    const y = Math.sin(particle.angle) * particle.distance * p - 40 * p * (1 - p);
    const opacity = p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3;
    const scale = p < 0.3 ? p / 0.3 : 1;

    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { rotate: `${particle.rotation * p}deg` },
        { scale },
      ],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: particle.color,
        },
        style,
      ]}
    />
  );
}

interface ConfettiEffectProps {
  onComplete?: () => void;
}

export function ConfettiEffect({ onComplete }: ConfettiEffectProps) {
  const particles = generateParticles();

  useEffect(() => {
    if (onComplete) {
      const timeout = setTimeout(onComplete, DURATION + 400);
      return () => clearTimeout(timeout);
    }
  }, [onComplete]);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle, i) => (
        <ParticleView key={i} particle={particle} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  particle: {
    position: 'absolute',
  },
});
