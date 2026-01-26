import { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import type { Exercise } from '@/types/content';
import { CodeEditor } from '@/components/code/CodeEditor';
import Colors from '@/constants/Colors';

interface PredictOutputProps {
  exercise: Exercise;
  onSubmit: (answer: string) => void;
  disabled?: boolean;
}

export function PredictOutput({ exercise, onSubmit, disabled }: PredictOutputProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <CodeEditor
        initialCode={exercise.starterCode || ''}
        readOnly
        showRunButton={false}
        showLineNumbers
        minHeight={60}
      />

      <View style={styles.options}>
        {(exercise.options || []).map((option, i) => {
          const isSelected = selected === option;
          return (
            <Pressable
              key={i}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
                disabled && styles.optionDisabled,
              ]}
              onPress={() => !disabled && setSelected(option)}
              disabled={disabled}
            >
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioDot} />}
              </View>
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={[
          styles.submitButton,
          (!selected || disabled) && styles.submitButtonDisabled,
        ]}
        onPress={() => selected && onSubmit(selected)}
        disabled={!selected || disabled}
      >
        <Text style={styles.submitText}>Submit Answer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  options: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#16213e',
    borderWidth: 1.5,
    borderColor: '#374151',
  },
  optionSelected: {
    borderColor: Colors.brand.primary,
    backgroundColor: Colors.brand.primary + '15',
  },
  optionDisabled: {
    opacity: 0.6,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6b7280',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: Colors.brand.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.brand.primary,
  },
  optionText: {
    flex: 1,
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: '#e5e7eb',
  },
  optionTextSelected: {
    color: '#f8f9fa',
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
