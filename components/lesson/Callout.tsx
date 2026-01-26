import { StyleSheet, View, Text } from 'react-native';
import Colors from '@/constants/Colors';

export type CalloutVariant = 'tip' | 'warning' | 'info' | 'error';

interface CalloutProps {
  content: string;
  variant?: CalloutVariant;
}

const VARIANT_CONFIG: Record<
  CalloutVariant,
  { icon: string; label: string; color: string }
> = {
  tip: { icon: '\u{1F4A1}', label: 'Tip', color: Colors.brand.accent },
  warning: { icon: '\u26A0\uFE0F', label: 'Warning', color: '#fbbf24' },
  info: { icon: '\u2139\uFE0F', label: 'Info', color: Colors.brand.secondary },
  error: { icon: '\u274C', label: 'Error', color: '#f87171' },
};

export function Callout({ content, variant = 'info' }: CalloutProps) {
  const config = VARIANT_CONFIG[variant];

  return (
    <View
      style={[
        styles.container,
        {
          borderLeftColor: config.color,
          backgroundColor: config.color + '15',
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{config.icon}</Text>
        <Text style={[styles.label, { color: config.color }]}>
          {config.label}
        </Text>
      </View>
      <Text style={styles.content}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  icon: {
    fontSize: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    color: '#f8f9fa',
  },
});
