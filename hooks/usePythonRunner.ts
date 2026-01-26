import { useRef, useState, useCallback } from 'react';
import type WebView from 'react-native-webview';
import type { ExecutionResult } from '@/types/python';

type PendingCallback = (result: ExecutionResult) => void;

export function usePythonRunner() {
  const webViewRef = useRef<WebView>(null);
  const [isReady, setIsReady] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pendingCallbacks = useRef<Map<string, PendingCallback>>(new Map());

  const handleMessage = useCallback((event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'ready') {
        setIsReady(true);
        setIsLoading(false);
      } else if (data.type === 'result') {
        const callback = pendingCallbacks.current.get(data.id);
        if (callback) {
          callback({
            success: data.success,
            stdout: data.stdout,
            stderr: data.stderr,
            result: data.result,
            error: data.error,
          });
          pendingCallbacks.current.delete(data.id);
        }
        setIsRunning(false);
      } else if (data.type === 'error') {
        setIsLoading(false);
      }
    } catch {
      // Ignore JSON parse errors
    }
  }, []);

  const runCode = useCallback(
    (code: string, timeout = 5000): Promise<ExecutionResult> => {
      return new Promise((resolve) => {
        if (!isReady || !webViewRef.current) {
          resolve({
            success: false,
            error: 'Python runtime not ready',
          });
          return;
        }

        const id = Math.random().toString(36).substring(2, 11);
        pendingCallbacks.current.set(id, resolve);
        setIsRunning(true);

        webViewRef.current.postMessage(
          JSON.stringify({
            type: 'run',
            id,
            code,
            timeout,
          })
        );

        // Safety timeout on the React Native side
        setTimeout(() => {
          if (pendingCallbacks.current.has(id)) {
            pendingCallbacks.current.delete(id);
            setIsRunning(false);
            resolve({
              success: false,
              error: 'Execution timed out',
            });
          }
        }, timeout + 2000);
      });
    },
    [isReady]
  );

  return {
    webViewRef,
    handleMessage,
    runCode,
    isReady,
    isRunning,
    isLoading,
  };
}
