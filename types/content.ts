export interface WorldMeta {
  id: string;
  name: string;
  description: string;
  icon: string;
  theme: {
    primaryColor: string;
    backgroundColor: string;
  };
  levelOrder: string[];
  bossLevelId: string;
}

export interface World {
  id: string;
  name: string;
  description: string;
  icon: string;
  theme: {
    primaryColor: string;
    backgroundColor: string;
    illustration: string;
  };
  levels: Level[];
  bossLevel: BossLevel;
}

export interface Level {
  id: string;
  worldId: string;
  order: number;
  title: string;
  concept: string;
  estimatedMinutes: number;
  content: LessonContent;
  exercises: Exercise[];
  challenge: Challenge;
}

export interface LessonContent {
  introduction: string;
  explanation: ContentBlock[];
  syntaxExample: CodeExample;
  commonMistakes: string[];
  realWorldUse: string;
}

export interface ContentBlock {
  type: 'text' | 'code' | 'image' | 'callout' | 'interactive';
  content: string;
  metadata?: Record<string, unknown>;
}

export interface CodeExample {
  code: string;
  output: string;
  highlightLines?: number[];
  annotations?: { line: number; text: string }[];
}

export type ExerciseType =
  | 'fill_blank'
  | 'fix_bug'
  | 'predict_output'
  | 'write_code'
  | 'multiple_choice';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Exercise {
  id: string;
  type: ExerciseType;
  difficulty: Difficulty;
  prompt: string;
  starterCode?: string;
  solution: string;
  testCases: TestCase[];
  hints: string[];
  explanation: string;
  options?: string[]; // for multiple_choice
}

export interface TestCase {
  input?: string;
  expectedOutput?: string;
  expectedResult?: unknown;
  hidden?: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  starterCode: string;
  testCases: TestCase[];
  bonusObjectives?: BonusObjective[];
}

export interface BonusObjective {
  description: string;
  testCase: TestCase;
  bonusXP: number;
}

export interface BossLevel extends Level {
  isBoss: true;
  parts: BossPart[];
  finalProject: {
    description: string;
    requirements: string[];
    evaluation: 'test_cases' | 'manual_review';
  };
}

export interface BossPart {
  title: string;
  description: string;
  starterCode: string;
  testCases: TestCase[];
}
