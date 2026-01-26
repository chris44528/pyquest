import { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import type { ConsoleEntry } from '@/types/python';

interface ConsoleProps {
  entries: ConsoleEntry[];
  isRunning?: boolean;
  maxHeight?: number;
}

const TYPE_COLORS: Record<ConsoleEntry['type'], string> = {
  stdout: '#f8f9fa',
  stderr: '#f87171',
  result: '#34d399',
  system: '#9ca3af',
};

export function Console({ entries, isRunning, maxHeight = 200 }: ConsoleProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [entries]);

  return (
    <View style={[styles.container, { maxHeight }]}>
      <ScrollView ref={scrollRef} style={styles.scroll}>
        {entries.map((entry, i) => (
          <Text
            key={i}
            style={[styles.text, { color: TYPE_COLORS[entry.type] }]}
          >
            {entry.text}
          </Text>
        ))}
        {isRunning && (
          <View style={styles.runningRow}>
            <ActivityIndicator size="small" color="#9ca3af" />
            <Text style={styles.runningText}>Running...</Text>
          </View>
        )}
        {entries.length === 0 && !isRunning && (
          <Text style={styles.placeholder}>Output will appear here</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f0f23',
    borderRadius: 12,
    padding: 12,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  text: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    lineHeight: 20,
  },
  runningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  runningText: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: '#9ca3af',
  },
  placeholder: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});
