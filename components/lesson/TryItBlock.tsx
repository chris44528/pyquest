import { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { CodeEditor } from '@/components/code/CodeEditor';
import { CodeBlock } from './CodeBlock';
import Colors from '@/constants/Colors';

interface TryItBlockProps {
  code: string;
  output?: string;
  onRun: (code: string) => Promise<{ success: boolean; stdout?: string; stderr?: string; error?: string }>;
}

export function TryItBlock({ code, output, onRun }: TryItBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editCode, setEditCode] = useState(code);
  const [runOutput, setRunOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleTryIt = () => {
    setIsEditing(true);
    setEditCode(code);
    setRunOutput(null);
  };

  const handleReset = () => {
    setEditCode(code);
    setRunOutput(null);
  };

  const handleRun = async () => {
    setIsRunning(true);
    const result = await onRun(editCode);
    if (result.success) {
      setRunOutput(result.stdout || '(no output)');
    } else {
      setRunOutput(result.error || result.stderr || 'Error running code');
    }
    setIsRunning(false);
  };

  if (!isEditing) {
    return (
      <View style={styles.container}>
        <CodeBlock code={code} output={output} />
        <Pressable style={styles.tryItButton} onPress={handleTryIt}>
          <Text style={styles.tryItButtonText}>
            {'\u270F\uFE0F'} Try It Yourself
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.editorHeader}>
        <Text style={styles.editorLabel}>{'\U0001F9EA'} Playground</Text>
        <Pressable style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </Pressable>
      </View>

      <CodeEditor
        initialCode={editCode}
        onCodeChange={setEditCode}
        onRun={async (c) => {
          const result = await onRun(c);
          if (result.success) {
            setRunOutput(result.stdout || '(no output)');
          } else {
            setRunOutput(result.error || result.stderr || 'Error');
          }
        }}
        showRunButton
        showLineNumbers
        minHeight={80}
      />

      {runOutput !== null && (
        <View style={styles.outputBox}>
          <Text style={styles.outputLabel}>Output</Text>
          <Text style={styles.outputText}>{runOutput}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <Pressable
          style={[styles.runButton, isRunning && styles.buttonDisabled]}
          onPress={handleRun}
          disabled={isRunning}
        >
          <Text style={styles.runButtonText}>
            {isRunning ? 'Running...' : '\u25B6 Run'}
          </Text>
        </Pressable>
        <Pressable style={styles.closeButton} onPress={() => setIsEditing(false)}>
          <Text style={styles.closeButtonText}>Close</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    gap: 8,
  },
  tryItButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: Colors.brand.secondary + '20',
    borderWidth: 1,
    borderColor: Colors.brand.secondary + '40',
  },
  tryItButtonText: {
    fontSize: 13,
    color: Colors.brand.secondary,
    fontWeight: '600',
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editorLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.brand.secondary,
  },
  resetButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: Colors.dark.card,
  },
  resetButtonText: {
    fontSize: 12,
    color: Colors.dark.subtle,
    fontWeight: '600',
  },
  outputBox: {
    backgroundColor: '#0f0f23',
    borderRadius: 10,
    padding: 12,
  },
  outputLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  outputText: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    lineHeight: 20,
    color: '#34d399',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  runButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.brand.secondary,
    alignItems: 'center',
  },
  runButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.dark.subtle,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
