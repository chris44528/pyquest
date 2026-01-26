import React, { createContext, useContext, type ReactNode } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { usePythonRunner } from '@/hooks/usePythonRunner';
import { pyodideHtml } from '@/lib/pyodideHtml';
import type { ExecutionResult } from '@/types/python';

interface PythonContextValue {
  runCode: (code: string, timeout?: number) => Promise<ExecutionResult>;
  isReady: boolean;
  isRunning: boolean;
  isLoading: boolean;
}

const PythonContext = createContext<PythonContextValue>({
  runCode: async () => ({ success: false, error: 'Python not initialized' }),
  isReady: false,
  isRunning: false,
  isLoading: true,
});

export function usePython() {
  return useContext(PythonContext);
}

interface PythonProviderProps {
  children: ReactNode;
}

export function PythonProvider({ children }: PythonProviderProps) {
  const { webViewRef, handleMessage, runCode, isReady, isRunning, isLoading } =
    usePythonRunner();

  return (
    <PythonContext.Provider value={{ runCode, isReady, isRunning, isLoading }}>
      {children}
      <View style={styles.webviewContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: pyodideHtml }}
          onMessage={handleMessage}
          javaScriptEnabled
          originWhitelist={['*']}
          style={styles.webview}
        />
      </View>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6c5ce7" />
          <Text style={styles.loadingText}>Loading Python...</Text>
        </View>
      )}
    </PythonContext.Provider>
  );
}

const styles = StyleSheet.create({
  webviewContainer: {
    height: 0,
    width: 0,
    position: 'absolute',
    opacity: 0,
  },
  webview: {
    height: 0,
    width: 0,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
  },
  loadingText: {
    marginTop: 16,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});
