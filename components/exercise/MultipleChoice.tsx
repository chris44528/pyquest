import { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import type { Exercise } from '@/types/content';
import Colors from '@/constants/Colors';

interface MultipleChoiceProps {
  exercise: Exercise;
  onSubmit: (answer: string) => void;
  disabled?: boolean;
}

export function MultipleChoice({ exercise, onSubmit, disabled }: MultipleChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <View style={styles.container}>
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
              <View
                style={[
                  styles.optionLabel,
                  isSelected && styles.optionLabelSelected,
                ]}
              >
                <Text
                  style={[
                    styles.optionLabelText,
                    isSelected && styles.optionLabelTextSelected,
                  ]}
                >
                  {optionLabels[i] || String(i + 1)}
                </Text>
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
    gap: 12,
    padding: 14,
    borderRadius: 12,
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
  optionLabel: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabelSelected: {
    backgroundColor: Colors.brand.primary,
  },
  optionLabelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9ca3af',
  },
  optionLabelTextSelected: {
    color: '#ffffff',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#e5e7eb',
  },
  optionTextSelected: {
    color: '#f8f9fa',
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
