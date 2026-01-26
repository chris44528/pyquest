import { useRef } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import type { Exercise } from '@/types/content';
import { CodeEditor, type CodeEditorHandle } from '@/components/code/CodeEditor';
import Colors from '@/constants/Colors';

interface FillBlankProps {
  exercise: Exercise;
  onSubmit: (code: string) => void;
  disabled?: boolean;
}

export function FillBlank({ exercise, onSubmit, disabled }: FillBlankProps) {
  const editorRef = useRef<CodeEditorHandle>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>
        Replace the blank ({"_____"}) with the correct code
      </Text>

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
        <Text style={styles.submitText}>Check Answer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  hint: {
    fontSize: 13,
    color: '#9ca3af',
    fontStyle: 'italic',
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
