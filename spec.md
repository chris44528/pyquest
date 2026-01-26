# PyQuest: Python Learning Game for iOS
## Technical Specification v1.0

---

## 1. Vision & End State

### What "Complete" Looks Like

**The App Experience:**
A mobile-first Python learning game where the user progresses through increasingly challenging levels, writes real Python code that executes in-app, earns XP and achievements, and builds genuine Python proficiency — all while waiting for the kettle to boil or sitting on the train.

**Core Loop:**
```
Learn concept → Practice in guided exercise → Apply in challenge → Earn rewards → Unlock next level
```

**Completion Criteria:**
- [ ] User can progress from zero Python knowledge to intermediate proficiency
- [ ] Code executes locally (offline-capable) via Pyodide
- [ ] Gamification creates genuine engagement (streaks, XP, achievements)
- [ ] Content covers Python fundamentals through practical application
- [ ] Runs smoothly on iOS via Expo/React Native

---

## 2. Curriculum Scope

### Learning Path Structure

```
WORLD 1: Foundations (Levels 1-10)
├── Variables & Data Types
├── Basic Operators
├── Strings & String Methods
├── Input/Output
└── Boss: Build a Mad Libs Generator

WORLD 2: Control Flow (Levels 11-20)
├── Conditionals (if/elif/else)
├── Comparison Operators
├── Logical Operators
├── While Loops
├── For Loops
└── Boss: Build a Number Guessing Game

WORLD 3: Data Structures (Levels 21-30)
├── Lists
├── List Methods & Slicing
├── Tuples
├── Dictionaries
├── Sets
└── Boss: Build a Contact Manager

WORLD 4: Functions (Levels 31-40)
├── Defining Functions
├── Parameters & Arguments
├── Return Values
├── Scope
├── Lambda Functions
└── Boss: Build a Calculator with History

WORLD 5: Working with Data (Levels 41-50)
├── File Handling Concepts
├── JSON Data
├── List Comprehensions
├── Dictionary Comprehensions
├── Error Handling (try/except)
└── Boss: Build a Quiz Game Engine

WORLD 6: Object-Oriented Python (Levels 51-60)
├── Classes & Objects
├── __init__ and self
├── Methods
├── Inheritance
├── Magic Methods
└── Boss: Build an RPG Character System

WORLD 7: Practical Python (Levels 61-70)
├── Modules & Imports
├── Working with APIs (concepts)
├── Regular Expressions Basics
├── Datetime Handling
├── Best Practices & PEP8
└── Final Boss: Build a CLI Task Manager
```

### Level Structure (Each Level Contains)

1. **Concept Introduction** (1-2 minutes read)
   - Clear explanation with real-world analogy
   - Syntax breakdown with visual highlighting
   - Common pitfalls highlighted

2. **Guided Practice** (3-5 exercises)
   - Fill-in-the-blank code completion
   - Fix-the-bug challenges
   - Predict-the-output quizzes
   - Write-from-scratch (with hints available)

3. **Challenge** (1-2 harder problems)
   - Apply concept without hand-holding
   - Multiple valid solutions accepted
   - Bonus objectives for extra XP

4. **Boss Levels** (End of each World)
   - Multi-part project
   - Combines all concepts from the World
   - Significant XP and achievement rewards

---

## 3. Technical Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native / Expo App                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Screens   │  │  Components │  │   State Management  │  │
│  │             │  │             │  │   (Zustand/Context) │  │
│  │ - Home      │  │ - CodeEditor│  │                     │  │
│  │ - World Map │  │ - Console   │  │ - User Progress     │  │
│  │ - Level     │  │ - Lesson    │  │ - Current Level     │  │
│  │ - Profile   │  │ - Quiz      │  │ - Achievements      │  │
│  │ - Settings  │  │ - Challenge │  │ - Settings          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                      Code Execution Layer                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                 WebView + Pyodide                      │  │
│  │                                                        │  │
│  │  - Loads Pyodide WASM bundle (cached after first load)│  │
│  │  - Receives code via postMessage                      │  │
│  │  - Returns stdout/stderr/results                      │  │
│  │  - Handles timeouts and infinite loop protection      │  │
│  └───────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                      Persistence Layer                       │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              AsyncStorage / SQLite                      ││
│  │                                                         ││
│  │  - User progress (levels completed, XP, streaks)       ││
│  │  - Code submissions (for review/retry)                 ││
│  │  - Settings and preferences                            ││
│  │  - Cached lesson content                               ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | Expo SDK 52+ | Already familiar, iOS deployment sorted |
| Navigation | Expo Router | File-based routing, clean structure |
| State | Zustand | Lightweight, simple, persistent middleware |
| Storage | AsyncStorage + expo-sqlite | Simple KV for settings, SQLite for progress data |
| Code Execution | Pyodide 0.26+ in WebView | Offline Python, no backend needed |
| UI Components | Custom + NativeWind (Tailwind) | Consistent styling, familiar from web |
| Animations | Reanimated 3 | Smooth gamification animations |
| Haptics | expo-haptics | Tactile feedback for achievements |

---

## 4. Core Systems Design

### 4.1 Code Execution Engine

**Architecture:**
```
┌──────────────────┐     postMessage      ┌──────────────────┐
│   React Native   │ ──────────────────►  │     WebView      │
│                  │                      │                  │
│  - Send code     │                      │  - Pyodide WASM  │
│  - Receive output│  ◄──────────────────  │  - Execute code  │
│  - Handle errors │     postMessage      │  - Capture stdout│
└──────────────────┘                      └──────────────────┘
```

**Pyodide WebView HTML (bundled in app):**
```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/pyodide/v0.26.0/full/pyodide.js"></script>
</head>
<body>
<script>
let pyodide = null;

async function initPyodide() {
  pyodide = await loadPyodide();
  window.ReactNativeWebView.postMessage(JSON.stringify({ 
    type: 'ready' 
  }));
}

async function runCode(code, timeout = 5000) {
  if (!pyodide) {
    return { error: 'Pyodide not loaded' };
  }
  
  // Capture stdout
  pyodide.runPython(`
    import sys
    from io import StringIO
    sys.stdout = StringIO()
    sys.stderr = StringIO()
  `);
  
  try {
    // Timeout protection
    const result = await Promise.race([
      pyodide.runPythonAsync(code),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ]);
    
    const stdout = pyodide.runPython('sys.stdout.getvalue()');
    const stderr = pyodide.runPython('sys.stderr.getvalue()');
    
    return { 
      success: true, 
      result: result, 
      stdout: stdout,
      stderr: stderr 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Listen for messages from React Native
document.addEventListener('message', async (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'run') {
    const result = await runCode(data.code, data.timeout);
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'result',
      id: data.id,
      ...result
    }));
  }
});

initPyodide();
</script>
</body>
</html>
```

**React Native Hook:**
```typescript
// hooks/usePythonRunner.ts
import { useRef, useState, useCallback } from 'react';
import { WebView } from 'react-native-webview';

interface ExecutionResult {
  success: boolean;
  stdout?: string;
  stderr?: string;
  result?: any;
  error?: string;
}

export function usePythonRunner() {
  const webViewRef = useRef<WebView>(null);
  const [isReady, setIsReady] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const pendingCallbacks = useRef<Map<string, (result: ExecutionResult) => void>>(new Map());

  const handleMessage = useCallback((event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    
    if (data.type === 'ready') {
      setIsReady(true);
    } else if (data.type === 'result') {
      const callback = pendingCallbacks.current.get(data.id);
      if (callback) {
        callback(data);
        pendingCallbacks.current.delete(data.id);
      }
      setIsRunning(false);
    }
  }, []);

  const runCode = useCallback((code: string, timeout = 5000): Promise<ExecutionResult> => {
    return new Promise((resolve) => {
      if (!isReady || !webViewRef.current) {
        resolve({ success: false, error: 'Python runtime not ready' });
        return;
      }

      const id = Math.random().toString(36).substr(2, 9);
      pendingCallbacks.current.set(id, resolve);
      setIsRunning(true);

      webViewRef.current.postMessage(JSON.stringify({
        type: 'run',
        id,
        code,
        timeout
      }));
    });
  }, [isReady]);

  return { webViewRef, handleMessage, runCode, isReady, isRunning };
}
```

### 4.2 Progression System

**Data Model:**
```typescript
// types/progression.ts

interface UserProgress {
  id: string;
  currentWorld: number;
  currentLevel: number;
  totalXP: number;
  streak: {
    current: number;
    longest: number;
    lastActivityDate: string; // ISO date
  };
  achievements: Achievement[];
  levelProgress: Map<string, LevelProgress>; // levelId -> progress
  settings: UserSettings;
}

interface LevelProgress {
  levelId: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  stars: 0 | 1 | 2 | 3; // 0 = not completed, 1-3 based on performance
  xpEarned: number;
  attempts: number;
  bestTime?: number; // seconds
  completedAt?: string;
  exerciseProgress: ExerciseProgress[];
}

interface ExerciseProgress {
  exerciseId: string;
  completed: boolean;
  attempts: number;
  lastSubmission?: string; // stored code
  hintsUsed: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'progress' | 'streak' | 'skill' | 'secret';
}
```

**XP Rewards:**
```typescript
const XP_REWARDS = {
  exerciseComplete: 10,
  exerciseCompleteNoHints: 15,
  exerciseCompleteFirstTry: 20,
  levelComplete: 50,
  levelComplete3Stars: 100,
  bossComplete: 200,
  worldComplete: 500,
  streakDay: 25, // bonus per day of streak
  achievementUnlock: 50,
};
```

**Star Rating System:**
```typescript
function calculateStars(level: LevelProgress): 1 | 2 | 3 {
  const totalExercises = level.exerciseProgress.length;
  const perfectExercises = level.exerciseProgress.filter(
    e => e.completed && e.hintsUsed === 0 && e.attempts === 1
  ).length;
  
  const perfectRatio = perfectExercises / totalExercises;
  
  if (perfectRatio >= 0.8) return 3;
  if (perfectRatio >= 0.5) return 2;
  return 1;
}
```

### 4.3 Content System

**Lesson Format:**
```typescript
// types/content.ts

interface World {
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

interface Level {
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

interface LessonContent {
  introduction: string; // Markdown
  explanation: ContentBlock[];
  syntaxExample: CodeExample;
  commonMistakes: string[];
  realWorldUse: string;
}

interface ContentBlock {
  type: 'text' | 'code' | 'image' | 'callout' | 'interactive';
  content: string;
  metadata?: Record<string, any>;
}

interface CodeExample {
  code: string;
  output: string;
  highlightLines?: number[];
  annotations?: { line: number; text: string }[];
}

interface Exercise {
  id: string;
  type: 'fill_blank' | 'fix_bug' | 'predict_output' | 'write_code' | 'multiple_choice';
  difficulty: 'easy' | 'medium' | 'hard';
  prompt: string;
  starterCode?: string;
  solution: string;
  testCases: TestCase[];
  hints: string[];
  explanation: string;
}

interface TestCase {
  input?: string; // stdin input
  expectedOutput?: string; // stdout match
  expectedResult?: any; // return value match
  hidden?: boolean; // don't show to user
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  starterCode: string;
  testCases: TestCase[];
  bonusObjectives?: {
    description: string;
    testCase: TestCase;
    bonusXP: number;
  }[];
}

interface BossLevel extends Level {
  isBoss: true;
  parts: BossPart[];
  finalProject: {
    description: string;
    requirements: string[];
    evaluation: 'test_cases' | 'manual_review';
  };
}

interface BossPart {
  title: string;
  description: string;
  starterCode: string;
  testCases: TestCase[];
}
```

**Sample Level JSON:**
```json
{
  "id": "world1-level3",
  "worldId": "world1",
  "order": 3,
  "title": "Strings: Your First Data Type",
  "concept": "strings",
  "estimatedMinutes": 8,
  "content": {
    "introduction": "Text in Python is called a **string**. Think of it like a string of beads — each bead is a character.",
    "explanation": [
      {
        "type": "text",
        "content": "You create a string by wrapping text in quotes. Python accepts both single (`'`) and double (`\"`) quotes."
      },
      {
        "type": "code",
        "content": "name = \"Chris\"\ngreeting = 'Hello'\nprint(greeting, name)"
      },
      {
        "type": "callout",
        "content": "**Pro tip:** Pick one style and stick with it. Most Python devs prefer double quotes.",
        "metadata": { "variant": "info" }
      }
    ],
    "syntaxExample": {
      "code": "message = \"Hello, World!\"\nprint(message)",
      "output": "Hello, World!",
      "highlightLines": [1],
      "annotations": [
        { "line": 1, "text": "The variable 'message' now holds this text" }
      ]
    },
    "commonMistakes": [
      "Forgetting to close quotes: `name = \"Chris` (missing end quote)",
      "Mixing quote styles: `name = \"Chris'` (started with double, ended with single)"
    ],
    "realWorldUse": "Strings are everywhere — usernames, messages, file contents, API responses. Any text your program handles is a string."
  },
  "exercises": [
    {
      "id": "w1l3-ex1",
      "type": "fill_blank",
      "difficulty": "easy",
      "prompt": "Create a variable called `city` that stores the text \"London\"",
      "starterCode": "_____ = _____\nprint(city)",
      "solution": "city = \"London\"\nprint(city)",
      "testCases": [
        { "expectedOutput": "London" }
      ],
      "hints": [
        "Variable names go on the left of the equals sign",
        "Text needs to be wrapped in quotes"
      ],
      "explanation": "We assign the string \"London\" to the variable `city`. The print function then outputs it."
    },
    {
      "id": "w1l3-ex2",
      "type": "fix_bug",
      "difficulty": "easy",
      "prompt": "This code has a bug. Find and fix it!",
      "starterCode": "greeting = \"Hello\nprint(greeting)",
      "solution": "greeting = \"Hello\"\nprint(greeting)",
      "testCases": [
        { "expectedOutput": "Hello" }
      ],
      "hints": [
        "Look carefully at the string on line 1",
        "Strings need to be closed with a matching quote"
      ],
      "explanation": "The string was missing its closing quote. Every opening quote needs a closing quote."
    },
    {
      "id": "w1l3-ex3",
      "type": "predict_output",
      "difficulty": "medium",
      "prompt": "What will this code print?",
      "starterCode": "first = \"Py\"\nsecond = \"thon\"\nprint(first + second)",
      "solution": "Python",
      "testCases": [],
      "hints": [
        "The + operator joins strings together",
        "This is called concatenation"
      ],
      "explanation": "The + operator concatenates (joins) strings. \"Py\" + \"thon\" = \"Python\"."
    }
  ],
  "challenge": {
    "id": "w1l3-challenge",
    "title": "Build a Greeting",
    "description": "Create a program that stores a name and greeting, then prints them together.",
    "requirements": [
      "Create a variable `name` with any name",
      "Create a variable `greeting` with a greeting like \"Hello\" or \"Hi\"",
      "Print them together so it outputs something like \"Hello, Chris!\""
    ],
    "starterCode": "# Your code here\n",
    "testCases": [
      { "expectedOutput": ".*,.*!" }
    ],
    "bonusObjectives": [
      {
        "description": "Use an f-string instead of concatenation",
        "testCase": { "expectedOutput": ".*" },
        "bonusXP": 10
      }
    ]
  }
}
```

### 4.4 Gamification System

**Achievement Categories:**

```typescript
const ACHIEVEMENTS = {
  // Progress Achievements
  first_steps: {
    name: "First Steps",
    description: "Complete your first exercise",
    icon: "🎯",
    condition: (progress) => progress.totalExercisesCompleted >= 1
  },
  world_conqueror_1: {
    name: "Foundations Master",
    description: "Complete World 1",
    icon: "🏆",
    condition: (progress) => progress.worldsCompleted.includes('world1')
  },
  
  // Streak Achievements
  week_warrior: {
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "🔥",
    condition: (progress) => progress.streak.current >= 7
  },
  month_master: {
    name: "Month Master",
    description: "Maintain a 30-day streak",
    icon: "⚡",
    condition: (progress) => progress.streak.current >= 30
  },
  
  // Skill Achievements
  perfectionist: {
    name: "Perfectionist",
    description: "Get 3 stars on 10 levels",
    icon: "⭐",
    condition: (progress) => countThreeStarLevels(progress) >= 10
  },
  no_hints_hero: {
    name: "No Hints Hero",
    description: "Complete 20 exercises without using hints",
    icon: "🧠",
    condition: (progress) => progress.exercisesWithoutHints >= 20
  },
  
  // Secret Achievements
  night_owl: {
    name: "Night Owl",
    description: "Complete a level between midnight and 5am",
    icon: "🦉",
    condition: (progress, context) => {
      const hour = new Date().getHours();
      return hour >= 0 && hour < 5 && context.justCompletedLevel;
    }
  },
  speed_demon: {
    name: "Speed Demon",
    description: "Complete a level in under 2 minutes",
    icon: "💨",
    condition: (progress, context) => context.levelTime < 120
  }
};
```

**Streak Logic:**
```typescript
function updateStreak(progress: UserProgress): UserProgress {
  const today = new Date().toISOString().split('T')[0];
  const lastActivity = progress.streak.lastActivityDate;
  
  if (!lastActivity) {
    // First ever activity
    return {
      ...progress,
      streak: { current: 1, longest: 1, lastActivityDate: today }
    };
  }
  
  const lastDate = new Date(lastActivity);
  const todayDate = new Date(today);
  const diffDays = Math.floor(
    (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (diffDays === 0) {
    // Same day, no change
    return progress;
  } else if (diffDays === 1) {
    // Consecutive day, increment streak
    const newStreak = progress.streak.current + 1;
    return {
      ...progress,
      streak: {
        current: newStreak,
        longest: Math.max(newStreak, progress.streak.longest),
        lastActivityDate: today
      }
    };
  } else {
    // Streak broken, reset to 1
    return {
      ...progress,
      streak: {
        ...progress.streak,
        current: 1,
        lastActivityDate: today
      }
    };
  }
}
```

---

## 5. Screen Flow & UI

### Navigation Structure

```
App
├── (tabs)
│   ├── index.tsx (Home - Daily challenge, continue learning)
│   ├── worlds.tsx (World Map - Overview of all worlds)
│   ├── profile.tsx (Stats, achievements, settings)
│   └── _layout.tsx (Tab bar)
├── world/[worldId]/
│   ├── index.tsx (World detail - levels grid)
│   └── level/[levelId]/
│       ├── index.tsx (Level - lesson + exercises)
│       ├── challenge.tsx (End of level challenge)
│       └── complete.tsx (Completion celebration)
├── boss/[worldId].tsx (Boss level special layout)
└── _layout.tsx (Root layout with Pyodide WebView)
```

### Key Screens

**1. Home Screen**
```
┌─────────────────────────────────┐
│  🔥 12 day streak        ⭐ 2,450│
├─────────────────────────────────┤
│                                 │
│  Good morning, Chris!           │
│                                 │
│  ┌───────────────────────────┐  │
│  │  📚 Continue Learning      │  │
│  │  World 2: Control Flow     │  │
│  │  Level 15: While Loops     │  │
│  │  ████████░░ 80%            │  │
│  │                    [GO →]  │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  ⚡ Daily Challenge        │  │
│  │  Earn 50 bonus XP!         │  │
│  │                    [START] │  │
│  └───────────────────────────┘  │
│                                 │
│  Recent Achievements            │
│  🏆 Week Warrior  🧠 Bug Hunter │
│                                 │
└─────────────────────────────────┘
```

**2. World Map**
```
┌─────────────────────────────────┐
│  Your Journey                   │
├─────────────────────────────────┤
│                                 │
│  ┌─────┐                        │
│  │ 🏰  │ World 7: Practical     │
│  │ 🔒  │ [LOCKED]               │
│  └──┼──┘                        │
│     │                           │
│  ┌──┼──┐                        │
│  │ 🎭 │ World 6: OOP            │
│  │ 🔒  │ [LOCKED]               │
│  └──┼──┘                        │
│     │                           │
│  ┌──┼──┐                        │
│  │ 📊 │ World 5: Data           │
│  │ ▶️  │ [AVAILABLE]            │
│  └──┼──┘                        │
│     │                           │
│  ┌──┼──┐                        │
│  │ 🔧 │ World 4: Functions      │
│  │ ⭐⭐⭐│ [COMPLETE]             │
│  └─────┘                        │
│                                 │
└─────────────────────────────────┘
```

**3. Level Screen (Exercise Mode)**
```
┌─────────────────────────────────┐
│ [←] Strings          3/5 ⭐⭐⭐   │
├─────────────────────────────────┤
│                                 │
│  Fix the bug in this code:     │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 1  greeting = "Hello      │  │
│  │ 2  print(greeting)        │  │
│  │ 3                         │  │
│  │ ▌                         │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ Output:                   │  │
│  │ SyntaxError: EOL while    │  │
│  │ scanning string literal   │  │
│  └───────────────────────────┘  │
│                                 │
│  [💡 Hint (2 left)]   [▶ RUN]  │
│                                 │
└─────────────────────────────────┘
```

**4. Level Complete Celebration**
```
┌─────────────────────────────────┐
│                                 │
│           ⭐ ⭐ ⭐               │
│                                 │
│      🎉 Level Complete! 🎉      │
│                                 │
│      Strings: Mastered          │
│                                 │
│   ┌─────────────────────────┐   │
│   │  +50 XP  Level Complete │   │
│   │  +30 XP  3 Stars        │   │
│   │  +15 XP  No Hints Used  │   │
│   │  ─────────────────────  │   │
│   │  +95 XP  Total          │   │
│   └─────────────────────────┘   │
│                                 │
│   🏆 Achievement Unlocked!      │
│      "Perfectionist"            │
│                                 │
│        [CONTINUE →]             │
│                                 │
└─────────────────────────────────┘
```

---

## 6. Build Phases

Working backwards from complete, here's the build sequence:

### Phase 1: Foundation (Week 1)
**Goal:** App shell with Pyodide working

- [x] Expo project setup with Expo Router
- [x] Basic tab navigation (Home, Worlds, Profile)
- [x] Pyodide WebView integration
- [x] usePythonRunner hook working
- [x] Simple "run code" test screen
- [x] Basic state management setup (Zustand)
- [x] AsyncStorage for persistence

**Deliverable:** Can write Python code and see output *(implemented, needs device verification)*

### Phase 2: Core Loop (Week 2)
**Goal:** One complete playable level

- [ ] Lesson content renderer (markdown + code blocks)
- [ ] Code editor component (basic, with line numbers)
- [ ] Console output component
- [ ] Exercise system (fill-blank, fix-bug, write-code)
- [ ] Test case runner
- [ ] Single level flow: lesson → exercises → challenge → complete
- [ ] Basic XP tracking

**Deliverable:** Can complete World 1, Level 1 end-to-end

### Phase 3: Content Structure (Week 3)
**Goal:** Full World 1 playable

- [ ] Level JSON schema and loader
- [ ] World map screen
- [ ] Level selection grid
- [ ] Progress tracking per level
- [ ] Star rating calculation
- [ ] Level locking/unlocking logic
- [ ] Create all World 1 content (10 levels)

**Deliverable:** World 1 fully playable with progression

### Phase 4: Gamification (Week 4)
**Goal:** Engaging reward systems

- [ ] Achievement system
- [ ] Streak tracking with visual feedback
- [ ] XP animations
- [ ] Level complete celebration screen
- [ ] Profile screen with stats
- [ ] Daily challenge system
- [ ] Haptic feedback integration

**Deliverable:** Feels like a game, not just an app

### Phase 5: Polish & Content (Weeks 5-6)
**Goal:** Complete, polished experience

- [ ] Boss level special UI
- [ ] All remaining Worlds content (2-7)
- [ ] Hint system with progressive reveals
- [ ] Code syntax highlighting
- [ ] Offline content caching
- [ ] Settings screen
- [ ] Onboarding flow
- [ ] App icon and splash screen
- [ ] Performance optimization
- [ ] TestFlight deployment

**Deliverable:** Ready for daily use

---

## 7. File Structure

```
pyquest/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx           # Home screen
│   │   ├── worlds.tsx          # World map
│   │   ├── profile.tsx         # User profile & stats
│   │   └── _layout.tsx         # Tab navigation
│   ├── world/
│   │   └── [worldId]/
│   │       ├── index.tsx       # World detail (levels)
│   │       └── level/
│   │           └── [levelId]/
│   │               ├── index.tsx      # Level content
│   │               ├── challenge.tsx  # Challenge mode
│   │               └── complete.tsx   # Celebration
│   ├── boss/
│   │   └── [worldId].tsx       # Boss level
│   ├── settings.tsx
│   ├── onboarding.tsx
│   └── _layout.tsx             # Root layout
├── components/
│   ├── code/
│   │   ├── CodeEditor.tsx
│   │   ├── Console.tsx
│   │   └── PythonRunner.tsx    # WebView wrapper
│   ├── lesson/
│   │   ├── LessonContent.tsx
│   │   ├── CodeBlock.tsx
│   │   └── Callout.tsx
│   ├── exercise/
│   │   ├── ExerciseCard.tsx
│   │   ├── FillBlank.tsx
│   │   ├── FixBug.tsx
│   │   ├── PredictOutput.tsx
│   │   └── WriteCode.tsx
│   ├── gamification/
│   │   ├── XPCounter.tsx
│   │   ├── StreakBadge.tsx
│   │   ├── StarRating.tsx
│   │   ├── AchievementPopup.tsx
│   │   └── LevelComplete.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── ProgressBar.tsx
│       └── Modal.tsx
├── hooks/
│   ├── usePythonRunner.ts
│   ├── useProgress.ts
│   ├── useAchievements.ts
│   └── useStreak.ts
├── stores/
│   ├── progressStore.ts        # Zustand store
│   └── settingsStore.ts
├── content/
│   ├── worlds/
│   │   ├── world1/
│   │   │   ├── index.json      # World metadata
│   │   │   ├── level1.json
│   │   │   ├── level2.json
│   │   │   └── ...
│   │   ├── world2/
│   │   └── ...
│   └── achievements.json
├── lib/
│   ├── testRunner.ts           # Test case execution
│   ├── xpCalculator.ts
│   └── contentLoader.ts
├── assets/
│   ├── pyodide.html            # Bundled WebView HTML
│   ├── images/
│   └── fonts/
├── types/
│   ├── content.ts
│   ├── progression.ts
│   └── index.ts
└── app.json
```

---

## 8. Key Implementation Notes

### Pyodide Considerations

1. **First Load:** Pyodide WASM is ~15MB. Cache it after first load.
2. **Timeout Protection:** Essential for infinite loops. 5 seconds default.
3. **Memory Limits:** Pyodide has memory constraints. Reset between complex operations if needed.
4. **No File System:** Can't actually read/write files. Simulate with string operations.
5. **No Network:** Pyodide can't make HTTP requests. Mock API concepts.

### Mobile-Specific UX

1. **Keyboard Handling:** Code editor needs proper keyboard avoidance
2. **Small Screen:** Keep lessons concise, scrollable
3. **Touch Targets:** All buttons minimum 44pt
4. **Offline First:** Everything works without network
5. **Quick Sessions:** Design for 5-10 minute bursts

### Content Creation Workflow

1. Write level JSON following schema
2. Test all exercises manually
3. Verify test cases pass with solution
4. Check hints make sense progressively
5. Add to content/ directory
6. Level automatically available

---

## 9. Success Metrics (Personal)

Since this is for personal use, here's how you'll know it's working:

- [ ] Using it instead of Facebook/Twitter
- [ ] Maintaining a streak feels rewarding
- [ ] Actually learning Python concepts
- [ ] Wanting to add more content
- [ ] Friends/family ask to try it

---

## 10. Future Enhancements (Post-MVP)

Ideas to consider after core is solid:

- **Spaced Repetition:** Review system for concepts you've learned
- **Code Golf Challenges:** Solve in minimum characters
- **Community Levels:** (if you open it up) User-created content
- **Themes:** Dark mode, custom color schemes
- **Export Progress:** Backup/restore functionality
- **Widget:** iOS widget showing streak
- **Apple Watch:** Streak notifications

---

*Spec version 1.0 — January 2025*