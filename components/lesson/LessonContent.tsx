import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import type { LessonContent as LessonContentType, ContentBlock } from '@/types/content';
import { CodeBlock } from './CodeBlock';
import { Callout, type CalloutVariant } from './Callout';
import Colors from '@/constants/Colors';

interface LessonContentProps {
  content: LessonContentType;
  onCodeRun?: (code: string) => void;
}

function renderBlock(block: ContentBlock, index: number, onCodeRun?: (code: string) => void) {
  switch (block.type) {
    case 'text':
      return (
        <Text key={index} style={styles.bodyText}>
          {block.content}
        </Text>
      );
    case 'code': {
      const meta = block.metadata as {
        output?: string;
        highlightLines?: number[];
        annotations?: { line: number; text: string }[];
        runnable?: boolean;
      } | undefined;
      return (
        <CodeBlock
          key={index}
          code={block.content}
          output={meta?.output}
          highlightLines={meta?.highlightLines}
          annotations={meta?.annotations}
          runnable={meta?.runnable}
          onRun={onCodeRun}
        />
      );
    }
    case 'callout': {
      const variant = (block.metadata?.variant as CalloutVariant) ?? 'info';
      return (
        <Callout
          key={index}
          content={block.content}
          variant={variant}
        />
      );
    }
    default:
      return (
        <Text key={index} style={styles.bodyText}>
          {block.content}
        </Text>
      );
  }
}

function CollapsibleSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);

  const toggleExpanded = () => {
    const next = !expanded;
    setExpanded(next);
    height.value = withTiming(next ? 1 : 0, { duration: 250 });
    opacity.value = withTiming(next ? 1 : 0, { duration: 200 });
  };

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    maxHeight: height.value * 500,
    overflow: 'hidden' as const,
  }));

  return (
    <View style={styles.collapsibleContainer}>
      <Pressable style={styles.collapsibleHeader} onPress={toggleExpanded}>
        <Text style={styles.collapsibleTitle}>{title}</Text>
        <Text style={styles.collapsibleArrow}>
          {expanded ? '\u25B2' : '\u25BC'}
        </Text>
      </Pressable>
      <Animated.View style={animStyle}>{children}</Animated.View>
    </View>
  );
}

export function LessonContent({ content, onCodeRun }: LessonContentProps) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Introduction */}
      <Text style={styles.introduction}>{content.introduction}</Text>

      {/* Explanation blocks */}
      {content.explanation.map((block, i) => renderBlock(block, i, onCodeRun))}

      {/* Syntax example */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Syntax</Text>
        <CodeBlock
          code={content.syntaxExample.code}
          output={content.syntaxExample.output}
          highlightLines={content.syntaxExample.highlightLines}
          annotations={content.syntaxExample.annotations}
        />
      </View>

      {/* Common mistakes (collapsible) */}
      <CollapsibleSection title="Common Mistakes">
        <View style={styles.mistakesList}>
          {content.commonMistakes.map((mistake, i) => (
            <View key={i} style={styles.mistakeItem}>
              <Text style={styles.mistakeBullet}>{'\u26A0\uFE0F'}</Text>
              <Text style={styles.mistakeText}>{mistake}</Text>
            </View>
          ))}
        </View>
      </CollapsibleSection>

      {/* Real-world use */}
      <View style={styles.realWorldSection}>
        <Text style={styles.realWorldTitle}>
          {'\U0001F30D'} Real-World Use
        </Text>
        <Text style={styles.realWorldText}>{content.realWorldUse}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  introduction: {
    fontSize: 16,
    lineHeight: 24,
    color: '#f8f9fa',
    marginBottom: 16,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#e5e7eb',
    marginVertical: 8,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8f9fa',
    marginBottom: 8,
  },
  collapsibleContainer: {
    marginTop: 20,
    backgroundColor: '#16213e',
    borderRadius: 12,
    overflow: 'hidden',
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  collapsibleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.brand.accent,
  },
  collapsibleArrow: {
    fontSize: 12,
    color: Colors.brand.accent,
  },
  mistakesList: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 10,
  },
  mistakeItem: {
    flexDirection: 'row',
    gap: 8,
  },
  mistakeBullet: {
    fontSize: 14,
    marginTop: 1,
  },
  mistakeText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#e5e7eb',
  },
  realWorldSection: {
    marginTop: 20,
    backgroundColor: Colors.brand.secondary + '15',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: Colors.brand.secondary,
  },
  realWorldTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.brand.secondary,
    marginBottom: 8,
  },
  realWorldText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#e5e7eb',
  },
});
