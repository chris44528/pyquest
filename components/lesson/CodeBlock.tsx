import { StyleSheet, View, Text, Pressable } from 'react-native';
import Colors from '@/constants/Colors';

interface Annotation {
  line: number;
  text: string;
}

interface CodeBlockProps {
  code: string;
  output?: string;
  highlightLines?: number[];
  annotations?: Annotation[];
  runnable?: boolean;
  onRun?: (code: string) => void;
}

export function CodeBlock({
  code,
  output,
  highlightLines = [],
  annotations = [],
  runnable,
  onRun,
}: CodeBlockProps) {
  const lines = code.split('\n');
  const highlightSet = new Set(highlightLines);
  const annotationMap = new Map(annotations.map((a) => [a.line, a.text]));

  return (
    <View style={styles.container}>
      {runnable && onRun && (
        <Pressable
          style={({ pressed }) => [
            styles.playButton,
            pressed && styles.playButtonPressed,
          ]}
          onPress={() => onRun(code)}
        >
          <Text style={styles.playButtonText}>&#9654;</Text>
        </Pressable>
      )}

      <View style={styles.codeArea}>
        {lines.map((line, i) => {
          const lineNum = i + 1;
          const isHighlighted = highlightSet.has(lineNum);
          const annotation = annotationMap.get(lineNum);

          return (
            <View key={i}>
              <View
                style={[
                  styles.lineRow,
                  isHighlighted && styles.highlightedLine,
                ]}
              >
                <Text style={styles.lineNumber}>{lineNum}</Text>
                <Text style={styles.lineText}>{line}</Text>
              </View>
              {annotation && (
                <View style={styles.annotationRow}>
                  <Text style={styles.annotationText}>{annotation}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {output != null && output !== '' && (
        <>
          <View style={styles.divider} />
          <View style={styles.outputArea}>
            <Text style={styles.outputLabel}>Output</Text>
            <Text style={styles.outputText}>{output}</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f0f23',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
  },
  playButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    backgroundColor: Colors.brand.primary + '30',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  playButtonPressed: {
    opacity: 0.7,
  },
  playButtonText: {
    color: Colors.brand.primaryLight,
    fontSize: 12,
  },
  codeArea: {
    padding: 12,
  },
  lineRow: {
    flexDirection: 'row',
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  highlightedLine: {
    backgroundColor: Colors.brand.primary + '20',
  },
  lineNumber: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    lineHeight: 20,
    color: '#6b7280',
    width: 28,
    textAlign: 'right',
    marginRight: 12,
  },
  lineText: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    lineHeight: 20,
    color: '#f8f9fa',
    flex: 1,
  },
  annotationRow: {
    marginLeft: 40,
    marginTop: 2,
    marginBottom: 4,
    backgroundColor: Colors.brand.accent + '15',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  annotationText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.brand.accent,
  },
  divider: {
    height: 1,
    backgroundColor: '#374151',
    marginHorizontal: 12,
  },
  outputArea: {
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
});
