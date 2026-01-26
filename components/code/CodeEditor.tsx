import React, {
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useMemo,
} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Colors from '@/constants/Colors';

export interface CodeEditorHandle {
  setCode: (code: string) => void;
  getCode: () => string;
}

interface CodeEditorProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  onRun?: (code: string) => void;
  readOnly?: boolean;
  showRunButton?: boolean;
  showLineNumbers?: boolean;
  minHeight?: number;
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(
  function CodeEditor(
    {
      initialCode = '',
      onCodeChange,
      onRun,
      readOnly = false,
      showRunButton = true,
      showLineNumbers = true,
      minHeight = 120,
    },
    ref,
  ) {
    const [code, setCodeState] = useState(initialCode);

    useImperativeHandle(ref, () => ({
      setCode: (newCode: string) => {
        setCodeState(newCode);
        onCodeChange?.(newCode);
      },
      getCode: () => code,
    }));

    const handleChange = useCallback(
      (text: string) => {
        setCodeState(text);
        onCodeChange?.(text);
      },
      [onCodeChange],
    );

    const lineNumbers = useMemo(() => {
      const count = code.split('\n').length;
      return Array.from({ length: count }, (_, i) => String(i + 1)).join('\n');
    }, [code]);

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.container, { minHeight }]}>
          <View style={styles.editorRow}>
            {showLineNumbers && (
              <View style={styles.lineNumbers}>
                <Text style={styles.lineNumberText}>{lineNumbers}</Text>
              </View>
            )}
            <TextInput
              style={[
                styles.input,
                showLineNumbers ? styles.inputWithLineNumbers : styles.inputNoLineNumbers,
              ]}
              value={code}
              onChangeText={handleChange}
              multiline
              editable={!readOnly}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              textAlignVertical="top"
              placeholder="Write your code here..."
              placeholderTextColor="#6b7280"
            />
          </View>
          {showRunButton && onRun && (
            <Pressable
              style={({ pressed }) => [
                styles.runButton,
                pressed && styles.runButtonPressed,
              ]}
              onPress={() => onRun(code)}
            >
              <Text style={styles.runButtonText}>&#9654; Run</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f0f23',
    borderRadius: 12,
    overflow: 'hidden',
  },
  editorRow: {
    flexDirection: 'row',
    flex: 1,
  },
  lineNumbers: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#0a0a1a',
    alignItems: 'flex-end',
    minWidth: 36,
  },
  lineNumberText: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    lineHeight: 20,
    color: '#6b7280',
  },
  input: {
    flex: 1,
    fontFamily: 'SpaceMono',
    fontSize: 13,
    lineHeight: 20,
    color: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 12,
    textAlignVertical: 'top',
  },
  inputWithLineNumbers: {
    paddingLeft: 8,
  },
  inputNoLineNumbers: {
    paddingLeft: 12,
  },
  runButton: {
    backgroundColor: Colors.brand.primary,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  runButtonPressed: {
    opacity: 0.8,
  },
  runButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
  },
});
