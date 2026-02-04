import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Switch,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  useColorScheme,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore, type ThemeMode } from '@/stores/settingsStore';
import { useProgressStore } from '@/stores/progressStore';
import { tapHaptic } from '@/lib/haptics';
import Colors from '@/constants/Colors';

function SettingRow({
  icon,
  label,
  value,
  onToggle,
  colors,
}: {
  icon: string;
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  colors: typeof Colors.dark;
}) {
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={(v) => {
          tapHaptic();
          onToggle(v);
        }}
        trackColor={{ false: colors.border, true: Colors.brand.primary + '80' }}
        thumbColor={value ? Colors.brand.primary : '#9ca3af'}
      />
    </View>
  );
}

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'system', label: 'System', icon: '\u2699\uFE0F' },
  { value: 'light', label: 'Light', icon: '\u2600\uFE0F' },
  { value: 'dark', label: 'Dark', icon: '\uD83C\uDF19' },
];

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];


  const soundEffects = useSettingsStore((s) => s.soundEffects);
  const haptics = useSettingsStore((s) => s.haptics);
  const notifications = useSettingsStore((s) => s.notifications);
  const theme = useSettingsStore((s) => s.theme);
  const setSoundEffects = useSettingsStore((s) => s.setSoundEffects);
  const setHaptics = useSettingsStore((s) => s.setHaptics);
  const setNotifications = useSettingsStore((s) => s.setNotifications);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const resetProgress = useProgressStore((s) => s.resetProgress);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetInput, setResetInput] = useState('');

  const handleReset = () => {
    if (resetInput === 'RESET') {
      resetProgress();
      setShowResetConfirm(false);
      setResetInput('');
      Alert.alert('Progress Reset', 'All progress has been cleared.');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerShown: true,
          headerStyle: { backgroundColor: colorScheme === 'dark' ? '#1a1a2e' : '#f8f9fa' },
          headerTintColor: colors.text,
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
      >
        {/* Preferences */}
        <Text style={[styles.sectionHeader, { color: colors.subtle }]}>Preferences</Text>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow
            icon={'\uD83D\uDD0A'}
            label="Sound Effects"
            value={soundEffects}
            onToggle={setSoundEffects}
            colors={colors}
          />
          <SettingRow
            icon={'\uD83D\uDCF3'}
            label="Haptics"
            value={haptics}
            onToggle={setHaptics}
            colors={colors}
          />
          <SettingRow
            icon={'\uD83D\uDD14'}
            label="Notifications"
            value={notifications}
            onToggle={setNotifications}
            colors={colors}
          />
        </View>

        {/* Theme */}
        <Text style={[styles.sectionHeader, { color: colors.subtle }]}>Theme</Text>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor:
                      theme === opt.value
                        ? Colors.brand.primary + '20'
                        : 'transparent',
                    borderColor:
                      theme === opt.value
                        ? Colors.brand.primary
                        : colors.border,
                  },
                ]}
                onPress={() => {
                  tapHaptic();
                  setTheme(opt.value);
                }}
              >
                <Text style={styles.themeIcon}>{opt.icon}</Text>
                <Text
                  style={[
                    styles.themeLabel,
                    {
                      color: theme === opt.value ? Colors.brand.primaryLight : colors.subtle,
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Danger Zone */}
        <Text style={[styles.sectionHeader, { color: colors.subtle }]}>Danger Zone</Text>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {!showResetConfirm ? (
            <Pressable
              style={styles.resetButton}
              onPress={() => setShowResetConfirm(true)}
            >
              <Ionicons name="trash-outline" size={18} color="#f87171" />
              <Text style={styles.resetButtonText}>Reset All Progress</Text>
            </Pressable>
          ) : (
            <View style={styles.resetConfirm}>
              <Text style={[styles.resetWarning, { color: '#f87171' }]}>
                This will permanently delete all your progress, XP, achievements, and streaks.
              </Text>
              <Text style={[styles.resetInstruction, { color: colors.subtle }]}>
                Type RESET to confirm:
              </Text>
              <TextInput
                style={[
                  styles.resetInput,
                  {
                    color: colors.text,
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
                value={resetInput}
                onChangeText={setResetInput}
                autoCapitalize="characters"
                placeholder="RESET"
                placeholderTextColor={colors.subtle}
              />
              <View style={styles.resetActions}>
                <Pressable
                  style={[styles.resetCancel, { borderColor: colors.border }]}
                  onPress={() => {
                    setShowResetConfirm(false);
                    setResetInput('');
                  }}
                >
                  <Text style={[styles.resetCancelText, { color: colors.text }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.resetConfirmBtn,
                    {
                      opacity: resetInput === 'RESET' ? 1 : 0.4,
                    },
                  ]}
                  onPress={handleReset}
                  disabled={resetInput !== 'RESET'}
                >
                  <Text style={styles.resetConfirmText}>Delete Everything</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Version */}
        <Text style={[styles.version, { color: colors.subtle }]}>
          PyQuest v1.0.0
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  section: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: {
    fontSize: 20,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  themeRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  themeIcon: {
    fontSize: 22,
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f87171',
  },
  resetConfirm: {
    padding: 16,
    gap: 12,
  },
  resetWarning: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  resetInstruction: {
    fontSize: 13,
  },
  resetInput: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 2,
  },
  resetActions: {
    flexDirection: 'row',
    gap: 10,
  },
  resetCancel: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  resetCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resetConfirmBtn: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: '#dc2626',
    padding: 12,
    alignItems: 'center',
  },
  resetConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 8,
  },
});
