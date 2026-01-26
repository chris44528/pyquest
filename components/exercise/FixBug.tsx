import { useRef } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import type { Exercise } from '@/types/content';
import { CodeEditor, type CodeEditorHandle } from '@/components/code/CodeEditor';
import Colors from '@/constants/Colors';

interface FixBugProps {
  exercise: Exercise;
  onSubmit: (code: string) => void;
  disabled?: boolean;
}

export function FixBug({ exercise, onSubmit, disabled }: FixBugProps) {
  const editorRef = useRef<CodeEditorHandle>(null);

  return (
    <View style={styles.container}>
      <View style={styles.bugBadge}>
        <Text style={styles.bugIcon}>{'\U0001F41B'}</Text>
        <Text style={styles.bugText}>Find and fix the bug in this code</Text>
      </View>

      <CodeEditor
        ref={editorRef}
        initialCode={exercise.starterCode || ''}
        readOnly={disabled}
        showRunButton={false}
        showLineNumbers
        minHeight={80}
      />

      <Pressable
        style={[styles.submitButton, disabled && styles.submitButtonDisabled]}
        onPress={() => {
          const code = editorRef.current?.getCode() || '';
          onSubmit(code);
        }}
        disabled={disabled}
      >
        <Text style={styles.submitText}>Submit Fix</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  bugBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8717115',
    borderRadius: 8,
    padding: 10,
  },
  bugIcon: {
    fontSize: 16,
  },
  bugText: {
    fontSize: 13,
    color: '#f87171',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: Colors.brand.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
