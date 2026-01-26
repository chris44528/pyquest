import { useRef, useState, useCallback } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import type { Exercise } from '@/types/content';
import { CodeEditor, type CodeEditorHandle } from '@/components/code/CodeEditor';
import { Console } from '@/components/code/Console';
import type { ConsoleEntry } from '@/types/python';
import Colors from '@/constants/Colors';

interface WriteCodeProps {
  exercise: Exercise;
  onSubmit: (code: string) => void;
  disabled?: boolean;
  runCode?: (code: string) => Promise<{ success: boolean; stdout?: string; stderr?: string; error?: string }>;
}

export function WriteCode({ exercise, onSubmit, disabled, runCode }: WriteCodeProps) {
  const editorRef = useRef<CodeEditorHandle>(null);
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = useCallback(
    async (code: string) => {
      if (!runCode || isRunning) return;
      setIsRunning(true);
      setConsoleEntries([{ type: 'system', text: 'Running...' }]);

      const result = await runCode(code);

      const entries: ConsoleEntry[] = [];
      if (result.success) {
        if (result.stdout) {
          entries.push({ type: 'stdout', text: result.stdout });
        } else {
          entries.push({ type: 'system', text: '(no output)' });
        }
      } else {
        entries.push({
          type: 'stderr',
          text: result.error || result.stderr || 'Execution failed',
        });
      }
      setConsoleEntries(entries);
      setIsRunning(false);
    },
    [runCode, isRunning],
  );

  return (
    <View style={styles.container}>
      <CodeEditor
        ref={editorRef}
        initialCode={exercise.starterCode || ''}
        readOnly={disabled}
        showRunButton={!!runCode}
        onRun={handleRun}
        showLineNumbers
        minHeight={100}
      />

      <Console entries={consoleEntries} isRunning={isRunning} maxHeight={150} />

      <Pressable
        style={[styles.submitButton, disabled && styles.submitButtonDisabled]}
        onPress={() => {
          const code = editorRef.current?.getCode() || '';
          onSubmit(code);
        }}
        disabled={disabled}
      >
        <Text style={styles.submitText}>Submit Code</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
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
