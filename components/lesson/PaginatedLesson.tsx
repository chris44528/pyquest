import { useState, useMemo, useCallback } from 'react';
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
import { paginateLesson } from '@/lib/lessonPaginator';
import { CodeBlock } from './CodeBlock';
import { Callout, type CalloutVariant } from './Callout';
import { TryItBlock } from './TryItBlock';
import Colors from '@/constants/Colors';
import { tapHaptic } from '@/lib/haptics';

interface PaginatedLessonProps {
  content: LessonContentType;
  onCodeRun?: (code: string) => Promise<{ success: boolean; stdout?: string; stderr?: string; error?: string }>;
  onComplete: () => void;
}

function renderBlock(
  block: ContentBlock,
  index: number,
  onCodeRun?: PaginatedLessonProps['onCodeRun'],
) {
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

      if (meta?.runnable && onCodeRun) {
        return (
          <TryItBlock
            key={index}
            code={block.content}
            output={meta.output}
            onRun={onCodeRun}
          />
        );
      }

      return (
        <CodeBlock
          key={index}
          code={block.content}
          output={meta?.output}
          highlightLines={meta?.highlightLines}
          annotations={meta?.annotations}
        />
      );
    }
    case 'callout': {
      const variant = (block.metadata?.variant as CalloutVariant) ?? 'info';
      return <Callout key={index} content={block.content} variant={variant} />;
    }
    default:
      return (
        <Text key={index} style={styles.bodyText}>
          {block.content}
        </Text>
      );
  }
}

function PageDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.dotsContainer}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === current ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}

function MistakesPage({ mistakes }: { mistakes: string[] }) {
  return (
    <View style={styles.mistakesContainer}>
      {mistakes.map((mistake, i) => (
        <View key={i} style={styles.mistakeItem}>
          <Text style={styles.mistakeBullet}>{'\u26A0\uFE0F'}</Text>
          <Text style={styles.mistakeText}>{mistake}</Text>
        </View>
      ))}
    </View>
  );
}

function RealWorldPage({ text }: { text: string }) {
  return (
    <View style={styles.realWorldBox}>
      <Text style={styles.realWorldIcon}>{'\U0001F30D'}</Text>
      <Text style={styles.realWorldText}>{text}</Text>
    </View>
  );
}

export function PaginatedLesson({
  content,
  onCodeRun,
  onComplete,
}: PaginatedLessonProps) {
  const pages = useMemo(() => paginateLesson(content), [content]);
  const [currentPage, setCurrentPage] = useState(0);

  const slideX = useSharedValue(0);
  const slideOpacity = useSharedValue(1);

  const pageStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
    opacity: slideOpacity.value,
  }));

  const animateTransition = useCallback((direction: 'forward' | 'back', then: () => void) => {
    const offset = direction === 'forward' ? -30 : 30;
    slideOpacity.value = withTiming(0, { duration: 120 });
    slideX.value = withTiming(offset, { duration: 120 });

    setTimeout(() => {
      then();
      slideX.value = -offset;
      slideOpacity.value = 0;
      slideX.value = withTiming(0, { duration: 180 });
      slideOpacity.value = withTiming(1, { duration: 180 });
    }, 130);
  }, [slideX, slideOpacity]);

  const goNext = () => {
    tapHaptic();
    if (currentPage < pages.length - 1) {
      animateTransition('forward', () => setCurrentPage((p) => p + 1));
    } else {
      onComplete();
    }
  };

  const goBack = () => {
    if (currentPage > 0) {
      tapHaptic();
      animateTransition('back', () => setCurrentPage((p) => p - 1));
    }
  };

  const page = pages[currentPage];
  const isLastPage = currentPage === pages.length - 1;

  return (
    <View style={styles.container}>
      {/* Page dots */}
      <PageDots current={currentPage} total={pages.length} />

      {/* Page content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        key={currentPage} // force re-scroll to top
      >
        <Animated.View style={pageStyle}>
          {/* Page title */}
          {page.title && (
            <Text style={styles.pageTitle}>{page.title}</Text>
          )}

          {/* Page-type specific rendering */}
          {page.type === 'mistakes' ? (
            <MistakesPage mistakes={page.blocks.map((b) => b.content)} />
          ) : page.type === 'realworld' ? (
            <RealWorldPage text={page.blocks[0]?.content ?? ''} />
          ) : (
            page.blocks.map((block, i) => renderBlock(block, i, onCodeRun))
          )}
        </Animated.View>
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.navBar}>
        {currentPage > 0 ? (
          <Pressable style={styles.backButton} onPress={goBack}>
            <Text style={styles.backButtonText}>
              {'\u2190'} Back
            </Text>
          </Pressable>
        ) : (
          <View style={styles.spacer} />
        )}

        <Text style={styles.pageCounter}>
          {currentPage + 1} / {pages.length}
        </Text>

        <Pressable
          style={[styles.nextButton, isLastPage && styles.nextButtonFinal]}
          onPress={goNext}
        >
          <Text style={[styles.nextButtonText, isLastPage && styles.nextButtonTextFinal]}>
            {isLastPage ? 'Start Exercises \u2192' : 'Next \u2192'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: Colors.brand.primaryLight,
    width: 20,
  },
  dotInactive: {
    backgroundColor: Colors.dark.border,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8f9fa',
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 23,
    color: '#e5e7eb',
    marginVertical: 8,
  },
  mistakesContainer: {
    gap: 12,
  },
  mistakeItem: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: Colors.dark.card,
    borderRadius: 10,
    padding: 12,
  },
  mistakeBullet: {
    fontSize: 16,
    marginTop: 1,
  },
  mistakeText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: '#e5e7eb',
  },
  realWorldBox: {
    backgroundColor: Colors.brand.secondary + '15',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.brand.secondary,
    gap: 8,
  },
  realWorldIcon: {
    fontSize: 24,
  },
  realWorldText: {
    fontSize: 15,
    lineHeight: 23,
    color: '#e5e7eb',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    backgroundColor: Colors.dark.background,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.dark.card,
  },
  backButtonText: {
    color: Colors.dark.subtle,
    fontSize: 14,
    fontWeight: '600',
  },
  spacer: {
    width: 80,
  },
  pageCounter: {
    color: Colors.dark.subtle,
    fontSize: 13,
    fontWeight: '600',
  },
  nextButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.brand.primary + '40',
  },
  nextButtonFinal: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },
  nextButtonText: {
    color: Colors.brand.primaryLight,
    fontSize: 14,
    fontWeight: '700',
  },
  nextButtonTextFinal: {
    color: '#ffffff',
  },
});
