export const PYODIDE_VERSION = '0.26.4';

export const pyodideHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.js"></script>
</head>
<body>
<script>
let pyodide = null;
let isInitializing = false;

function sendMessage(data) {
  try {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(data));
    }
  } catch (e) {
    // Silently fail if messaging not available
  }
}

async function initPyodide() {
  if (isInitializing || pyodide) return;
  isInitializing = true;

  try {
    pyodide = await loadPyodide();
    sendMessage({ type: 'ready' });
  } catch (error) {
    sendMessage({
      type: 'error',
      error: 'Failed to initialize Python: ' + error.message
    });
  } finally {
    isInitializing = false;
  }
}

async function runCode(code, id, timeout) {
  if (!pyodide) {
    sendMessage({
      type: 'result',
      id: id,
      success: false,
      error: 'Python runtime not loaded yet'
    });
    return;
  }

  // Reset stdout/stderr capture
  pyodide.runPython(\`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
\`);

  try {
    // Add instruction counter for infinite loop detection
    const wrappedCode = \`
import sys

_pyquest_counter = 0
_pyquest_limit = 1000000

_pyquest_orig_trace = sys.gettrace()

def _pyquest_trace(frame, event, arg):
    global _pyquest_counter
    _pyquest_counter += 1
    if _pyquest_counter > _pyquest_limit:
        raise RuntimeError("Code execution limit exceeded (possible infinite loop)")
    return _pyquest_trace

sys.settrace(_pyquest_trace)
try:
\` + code.split('\\n').map(line => '    ' + line).join('\\n') + \`
finally:
    sys.settrace(_pyquest_orig_trace)
\`;

    // Race between execution and timeout
    const result = await Promise.race([
      pyodide.runPythonAsync(wrappedCode),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Code execution timed out (possible infinite loop)')), timeout || 5000)
      )
    ]);

    const stdout = pyodide.runPython('sys.stdout.getvalue()');
    const stderr = pyodide.runPython('sys.stderr.getvalue()');

    sendMessage({
      type: 'result',
      id: id,
      success: true,
      result: result !== undefined && result !== null ? String(result) : undefined,
      stdout: stdout || '',
      stderr: stderr || ''
    });
  } catch (error) {
    let stdout = '';
    let stderr = '';
    try {
      stdout = pyodide.runPython('sys.stdout.getvalue()') || '';
      stderr = pyodide.runPython('sys.stderr.getvalue()') || '';
    } catch (e) {
      // Ignore errors getting output
    }

    sendMessage({
      type: 'result',
      id: id,
      success: false,
      error: error.message || String(error),
      stdout: stdout,
      stderr: stderr
    });
  }
}

// Listen for messages from React Native (both window and document for cross-platform)
function handleMessage(event) {
  try {
    const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    if (data.type === 'run') {
      runCode(data.code, data.id, data.timeout);
    }
  } catch (e) {
    // Ignore parse errors
  }
}

window.addEventListener('message', handleMessage);
document.addEventListener('message', handleMessage);

// Start loading Pyodide
initPyodide();
</script>
</body>
</html>
`;
