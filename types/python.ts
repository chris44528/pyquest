export interface ExecutionResult {
  success: boolean;
  stdout?: string;
  stderr?: string;
  result?: unknown;
  error?: string;
}

export type PythonMessageType = 'ready' | 'result' | 'run' | 'error';

export interface PythonMessage {
  type: PythonMessageType;
  id?: string;
  code?: string;
  timeout?: number;
  success?: boolean;
  stdout?: string;
  stderr?: string;
  result?: unknown;
  error?: string;
}
