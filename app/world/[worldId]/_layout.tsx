import { Stack } from 'expo-router';
import Colors from '@/constants/Colors';

export default function WorldIdLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.dark.background },
        headerTintColor: Colors.dark.text,
        headerTitleStyle: { fontWeight: '700' },
        headerBackTitle: 'Back',
      }}
    />
  );
}
