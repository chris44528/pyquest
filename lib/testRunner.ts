import type { TestCase } from '@/types/content';
import type { ExecutionResult } from '@/types/python';

export interface TestResult {
  testCase: TestCase;
  passed: boolean;
  actual: string;
  expected: string;
  hidden: boolean;
}

export interface TestRunResult {
  allPassed: boolean;
  results: TestResult[];
  visibleResults: TestResult[];
  error?: string;
}

export type RunCodeFn = (code: string, timeout?: number) => Promise<ExecutionResult>;

export async function runTests(
  code: string,
  testCases: TestCase[],
  runCodeFn: RunCodeFn,
): Promise<TestRunResult> {
  const results: TestResult[] = [];

  for (const testCase of testCases) {
    try {
      const fullCode = testCase.input ? `${testCase.input}\n${code}` : code;
      const result = await runCodeFn(fullCode, 5000);

      if (!result.success) {
        results.push({
          testCase,
          passed: false,
          actual: result.error || result.stderr || 'Execution failed',
          expected: testCase.expectedOutput?.trim() || '',
          hidden: testCase.hidden ?? false,
        });
        continue;
      }

      const actual = (result.stdout || '').trim();
      const expected = (testCase.expectedOutput || '').trim();

      let passed = false;
      const regexMatch = expected.match(/^\/(.+)\/([gimsuy]*)$/);
      if (regexMatch) {
        const [, pattern, flags] = regexMatch;
        passed = new RegExp(pattern, flags).test(actual);
      } else {
        passed = actual === expected;
      }

      results.push({
        testCase,
        passed,
        actual,
        expected,
        hidden: testCase.hidden ?? false,
      });
    } catch (err) {
      results.push({
        testCase,
        passed: false,
        actual: err instanceof Error ? err.message : 'Unknown error',
        expected: testCase.expectedOutput?.trim() || '',
        hidden: testCase.hidden ?? false,
      });
    }
  }

  return {
    allPassed: results.every((r) => r.passed),
    results,
    visibleResults: results.filter((r) => !r.hidden),
  };
}
