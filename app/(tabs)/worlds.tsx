import { StyleSheet, View, Text, useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

export default function WorldsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.icon]}>&#127758;</Text>
        <Text style={[styles.title, { color: colors.text }]}>World Map</Text>
        <Text style={[styles.subtitle, { color: colors.subtle }]}>
          Your Python learning journey across 7 worlds and 70 levels.
        </Text>
        <Text style={[styles.comingSoon, { color: Colors.brand.primary }]}>
          Coming in Phase 3
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    width: '100%',
    maxWidth: 360,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  comingSoon: {
    fontSize: 14,
    fontWeight: '600',
  },
});
