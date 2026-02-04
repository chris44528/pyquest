import type { LessonContent, ContentBlock } from '@/types/content';

export interface LessonPage {
  title?: string;
  type: 'intro' | 'explanation' | 'syntax' | 'mistakes' | 'realworld';
  blocks: ContentBlock[];
}

/**
 * Auto-paginate a LessonContent into digestible pages.
 *
 * Rules:
 * 1. Introduction → page 1
 * 2. Each text block + its following code block(s) → one page
 * 3. Callouts attach to the preceding page
 * 4. Syntax example → its own page
 * 5. Common mistakes → one page
 * 6. Real-world use → final page
 */
export function paginateLesson(content: LessonContent): LessonPage[] {
  const pages: LessonPage[] = [];

  // Page 1: Introduction
  pages.push({
    type: 'intro',
    blocks: [{ type: 'text', content: content.introduction }],
  });

  // Group explanation blocks into pages
  let currentBlocks: ContentBlock[] = [];

  for (let i = 0; i < content.explanation.length; i++) {
    const block = content.explanation[i];
    const nextBlock = content.explanation[i + 1];

    if (block.type === 'text') {
      // If we have accumulated blocks, flush them first
      if (currentBlocks.length > 0) {
        pages.push({ type: 'explanation', blocks: [...currentBlocks] });
        currentBlocks = [];
      }
      currentBlocks.push(block);
    } else if (block.type === 'code') {
      // Code follows text — attach to current page
      currentBlocks.push(block);
      // If next block is text (new concept) or doesn't exist, flush
      if (!nextBlock || nextBlock.type === 'text') {
        pages.push({ type: 'explanation', blocks: [...currentBlocks] });
        currentBlocks = [];
      }
    } else if (block.type === 'callout') {
      // Callouts attach to current page
      currentBlocks.push(block);
    } else {
      // Other block types (image, interactive, etc.)
      currentBlocks.push(block);
    }
  }

  // Flush remaining blocks
  if (currentBlocks.length > 0) {
    pages.push({ type: 'explanation', blocks: currentBlocks });
  }

  // Syntax example page
  pages.push({
    title: 'Syntax',
    type: 'syntax',
    blocks: [
      {
        type: 'code',
        content: content.syntaxExample.code,
        metadata: {
          output: content.syntaxExample.output,
          highlightLines: content.syntaxExample.highlightLines,
          annotations: content.syntaxExample.annotations,
        },
      },
    ],
  });

  // Common mistakes page
  if (content.commonMistakes.length > 0) {
    pages.push({
      title: 'Common Mistakes',
      type: 'mistakes',
      blocks: content.commonMistakes.map((mistake) => ({
        type: 'text' as const,
        content: mistake,
      })),
    });
  }

  // Real-world use page
  pages.push({
    title: 'Real-World Use',
    type: 'realworld',
    blocks: [{ type: 'text', content: content.realWorldUse }],
  });

  return pages;
}
