# PyQuest Development Guide

**AI-Native Development Framework for Claude Code**

---

## Project Overview

**PyQuest** is a mobile-first Python learning game for iOS that transforms Python education into an engaging, gamified experience. Users progress through 70 levels across 7 worlds, writing real Python code that executes in-app via Pyodide, earning XP, achievements, and building genuine proficiency.

**Core Technology Stack:**
- **Framework**: Expo SDK 52+ / React Native
- **Navigation**: Expo Router (file-based)
- **State**: Zustand with persistence
- **Storage**: AsyncStorage + expo-sqlite
- **Code Execution**: Pyodide 0.26+ in WebView
- **Styling**: NativeWind (Tailwind for React Native)
- **Animations**: Reanimated 3

**Project Scope:** 147 actions across 6 phases, estimated 6 weeks (evenings/weekends)

---

## Quick Start Commands

### Development Workflow
```bash
# Start development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on physical device
npx expo start --tunnel

# Type checking
npx tsc --noEmit

# Build for testing
eas build --platform ios --profile preview
```

### AI-Assisted Development
```bash
# Load project context
/load @.

# Analyze architecture before major changes
/analyze --scope project --focus architecture

# Build specific component with best practices
/build @components/code/CodeEditor.tsx --persona-frontend

# Implement new feature with planning
/implement "daily challenge system" --think --validate

# Improve code quality
/improve @components --focus quality --persona-refactorer

# Create comprehensive tests
/test --type e2e --persona-qa
```

---

## Development Phases & Persona Recommendations

### Phase 1: Foundation (Actions 1-28)
**Goal**: App shell with Pyodide executing Python code

**Recommended Flags**: `--persona-architect --think --validate`

**Key Personas**:
- `--persona-architect`: System design, project structure, dependency management
- `--persona-backend`: Pyodide integration, WebView messaging, state management

**Critical Files**:
```
assets/pyodide.html              # Pyodide WebView HTML
hooks/usePythonRunner.ts         # Python execution hook
components/code/PythonRunner.tsx # WebView wrapper
stores/progressStore.ts          # Zustand state management
types/content.ts                 # Core TypeScript types
```

**MCP Integration**:
- `--c7`: For Expo, React Native, Pyodide documentation
- `--seq`: For complex Pyodide integration analysis

**Commands**:
```bash
# Setup project structure
/build "Expo project with tabs" --persona-architect --c7

# Implement Pyodide integration
/implement "Pyodide WebView with messaging" --think-hard --seq --c7

# Validate state management
/analyze @stores --focus architecture --persona-architect
```

---

### Phase 2: Core Loop (Actions 29-58)
**Goal**: One complete playable level end-to-end

**Recommended Flags**: `--persona-frontend --magic --validate`

**Key Personas**:
- `--persona-frontend`: UI components, code editor, lesson renderer
- `--persona-qa`: Exercise validation, test runner

**Critical Files**:
```
components/code/CodeEditor.tsx   # Code input with syntax highlighting
components/code/Console.tsx      # Output display
components/lesson/LessonContent.tsx # Markdown renderer
components/exercise/*.tsx        # Exercise variants
lib/testRunner.ts                # Test case validation
```

**MCP Integration**:
- `--magic`: For UI component generation and design systems
- `--c7`: For React Native component patterns
- `--play`: For E2E testing of user flows

**Commands**:
```bash
# Build code editor component
/build @components/code/CodeEditor.tsx --persona-frontend --magic --c7

# Implement exercise system
/implement "exercise components with validation" --persona-qa --validate

# Test complete level flow
/test "level completion flow" --type e2e --play --persona-qa
```

---

### Phase 3: Content Structure (Actions 59-90)
**Goal**: Full World 1 playable with 10 levels

**Recommended Flags**: `--persona-architect --think --delegate folders`

**Key Personas**:
- `--persona-architect`: Content loading system, progression architecture
- `--persona-scribe=en`: Content creation, lesson writing

**Critical Files**:
```
lib/contentLoader.ts             # JSON content loading
content/worlds/world1/*.json     # World 1 content (10 levels)
app/world/[worldId]/index.tsx    # World detail screen
hooks/useLevel.ts                # Level loading hook
```

**MCP Integration**:
- `--seq`: For content structure analysis and validation
- `--c7`: For JSON schema patterns and best practices

**Commands**:
```bash
# Design content loading system
/design "JSON-based content loader" --persona-architect --seq --c7

# Create World 1 content
/document @content/worlds/world1 --persona-scribe=en

# Analyze content structure
/analyze @content --focus architecture --delegate folders
```

---

### Phase 4: Gamification (Actions 91-115)
**Goal**: Feels like a game with rewards and progression

**Recommended Flags**: `--persona-frontend --magic --focus performance`

**Key Personas**:
- `--persona-frontend`: Animation, celebration screens, visual feedback
- `--persona-performance`: XP animations, streak calculations optimization

**Critical Files**:
```
lib/xpCalculator.ts              # XP reward calculations
components/gamification/*.tsx    # XP, streaks, stars, achievements
hooks/useAchievements.ts         # Achievement tracking
content/achievements.json        # Achievement definitions
```

**MCP Integration**:
- `--magic`: For gamification UI components
- `--seq`: For achievement condition logic

**Commands**:
```bash
# Build gamification components
/build @components/gamification --persona-frontend --magic --focus performance

# Implement achievement system
/implement "achievement tracking with conditions" --seq --validate

# Optimize animations
/improve @components/gamification --focus performance --persona-performance
```

---

### Phase 5: Polish & Home Screen (Actions 116-130)
**Goal**: Polished daily experience

**Recommended Flags**: `--persona-frontend --persona-refactorer --uc`

**Key Personas**:
- `--persona-frontend`: Home screen, profile, settings UI
- `--persona-refactorer`: Code cleanup, consistency improvements
- `--persona-qa`: Final validation and testing

**Critical Files**:
```
app/(tabs)/index.tsx             # Home screen
app/(tabs)/profile.tsx           # Profile screen
app/settings.tsx                 # Settings screen
```

**MCP Integration**:
- `--magic`: For polished UI components
- `--play`: For user flow validation

**Commands**:
```bash
# Polish home screen
/improve @app/(tabs)/index.tsx --persona-frontend --magic

# Cleanup codebase
/cleanup --persona-refactorer --focus quality

# Final validation
/test --type e2e --comprehensive --play --persona-qa
```

---

### Phase 6: Content & Deployment (Actions 131-147)
**Goal**: All content, ready for TestFlight

**Recommended Flags**: `--delegate auto --wave-mode --safe-mode`

**Key Personas**:
- `--persona-scribe=en`: Content creation for Worlds 2-7
- `--persona-devops`: Deployment, build optimization
- `--persona-qa`: Final testing and validation

**Critical Files**:
```
content/worlds/world2-7/*.json   # Remaining world content
app/onboarding.tsx               # First-time user flow
app.json                         # Expo configuration
eas.json                         # EAS Build configuration
```

**MCP Integration**:
- `--seq`: For systematic content creation across multiple worlds
- `--c7`: For deployment best practices
- `--all-mcp`: For comprehensive final validation

**Commands**:
```bash
# Create all remaining content (large-scale operation)
/document @content/worlds --persona-scribe=en --delegate auto --wave-mode

# Optimize for production
/improve --scope project --focus performance --safe-mode --persona-performance

# Deploy to TestFlight
/git "prepare for TestFlight deployment" --persona-devops --validate
```

---

## Architecture Deep Dive

### Pyodide Integration Architecture

**Critical Challenge**: Running Python in a mobile app offline

**Solution**: Pyodide WASM in WebView with message-based communication

```typescript
// Message Flow
React Native → postMessage → WebView (Pyodide)
                              ↓
                        Execute Python
                              ↓
                    Capture stdout/stderr
                              ↓
React Native ← postMessage ← WebView
```

**Key Considerations**:
1. **Timeout Protection**: 5-second default prevents infinite loops
2. **Memory Management**: Reset Pyodide between complex operations
3. **Caching**: 15MB WASM bundle cached after first load
4. **Error Handling**: Graceful fallback for execution failures
5. **Offline-First**: No network required after initial load

**Implementation Pattern**:
```typescript
// hooks/usePythonRunner.ts - Core execution hook
const { runCode, isReady } = usePythonRunner();

// Execute Python with timeout
const result = await runCode(`
  name = "PyQuest"
  print(f"Welcome to {name}!")
`, 5000);

// Handle result
if (result.success) {
  console.log(result.stdout); // "Welcome to PyQuest!"
} else {
  console.error(result.error); // Timeout or syntax error
}
```

---

### State Management Architecture

**Design Philosophy**: Single source of truth with persistence

**Zustand Stores**:

1. **progressStore.ts** - User progression data
   ```typescript
   interface ProgressStore {
     totalXP: number;
     currentWorld: number;
     currentLevel: number;
     streak: StreakData;
     levelProgress: Map<string, LevelProgress>;
     achievements: Achievement[];

     // Actions
     updateXP: (amount: number) => void;
     completeExercise: (levelId: string, exerciseId: string) => void;
     completeLevel: (levelId: string, stars: number) => void;
     updateStreak: () => void;
   }
   ```

2. **settingsStore.ts** - User preferences
   ```typescript
   interface SettingsStore {
     theme: 'light' | 'dark' | 'system';
     haptics: boolean;
     notifications: boolean;
     soundEffects: boolean;
   }
   ```

**Persistence Strategy**:
- AsyncStorage for settings (simple key-value)
- Zustand persist middleware for progress (JSON serialization)
- Automatic save on state changes
- Rehydration on app launch

---

### Content System Architecture

**Design Philosophy**: JSON-based, type-safe, hot-reloadable

**Content Structure**:
```
content/
├── worlds/
│   ├── world1/
│   │   ├── index.json       # World metadata
│   │   ├── level1.json      # Level content
│   │   ├── level2.json
│   │   └── ... (10 levels)
│   ├── world2/
│   └── ...
└── achievements.json        # All achievement definitions
```

**Type Safety**:
```typescript
// All content validated against TypeScript interfaces
interface Level {
  id: string;
  worldId: string;
  title: string;
  content: LessonContent;
  exercises: Exercise[];
  challenge: Challenge;
}

// Runtime validation with Zod (optional enhancement)
const LevelSchema = z.object({
  id: z.string(),
  worldId: z.string(),
  title: z.string(),
  // ...
});
```

**Loading Strategy**:
1. Lazy load levels as needed
2. Cache loaded content in memory
3. Preload next level in background
4. Bundle content with app (offline-capable)

---

## Code Quality Standards

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**AI Assistance**:
```bash
# Type checking before commits
/analyze @. --focus quality --persona-refactorer

# Fix type errors
/improve @hooks --focus quality --validate
```

---

### Component Patterns

**Functional Components with Hooks**:
```typescript
// Good: Clear, typed, testable
export function CodeEditor({ initialCode, onRun }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const { runCode, isRunning } = usePythonRunner();

  const handleRun = async () => {
    const result = await runCode(code);
    onRun(result);
  };

  return (
    <View>
      <TextInput value={code} onChangeText={setCode} />
      <Button onPress={handleRun} disabled={isRunning} />
    </View>
  );
}
```

**AI Assistance**:
```bash
# Generate component with best practices
/build @components/code/CodeEditor.tsx --persona-frontend --magic --c7

# Refactor to follow patterns
/improve @components/code --focus quality --persona-refactorer
```

---

### Testing Strategy

**Test Pyramid**:
1. **Unit Tests** (80% coverage target)
   - Hooks (usePythonRunner, useProgress)
   - Utilities (testRunner, xpCalculator)
   - State management (stores)

2. **Integration Tests** (70% coverage target)
   - Component interactions
   - Exercise validation
   - Content loading

3. **E2E Tests** (Critical paths only)
   - Complete level flow
   - Achievement unlocking
   - Streak tracking

**AI Assistance**:
```bash
# Generate tests for critical paths
/test @hooks/usePythonRunner.ts --persona-qa

# E2E testing with Playwright
/test "complete World 1 Level 1" --type e2e --play --persona-qa
```

---

## Security & Performance

### Security Considerations

1. **Code Execution Sandbox**: Pyodide runs in isolated WebView
2. **Timeout Protection**: Prevent infinite loops (5s default)
3. **Input Validation**: Validate all user code before execution
4. **No File System Access**: Pyodide can't access device storage
5. **No Network Access**: Pyodide can't make HTTP requests

**AI Assistance**:
```bash
# Security audit
/analyze @. --focus security --persona-security --validate

# Validate input handling
/improve @hooks/usePythonRunner.ts --focus security --persona-security
```

---

### Performance Optimization

**Critical Metrics**:
- **App Launch**: < 2s to interactive
- **Code Execution**: < 500ms for simple code
- **Navigation**: 60 FPS animations
- **Memory**: < 150MB RAM usage

**Optimization Strategies**:
1. **Lazy Loading**: Load levels on demand
2. **Memoization**: Cache expensive calculations
3. **Image Optimization**: Use optimized assets
4. **List Virtualization**: Use FlatList for long lists
5. **Code Splitting**: Bundle splitting with Expo Router

**AI Assistance**:
```bash
# Performance audit
/analyze @. --focus performance --persona-performance

# Optimize animations
/improve @components/gamification --focus performance --persona-performance
```

---

## Content Creation Guidelines

### Lesson Writing Principles

**Target Audience**: Complete beginners to intermediate Python learners

**Lesson Structure**:
1. **Hook** (30 seconds): Real-world analogy or problem
2. **Concept** (1 minute): Clear explanation with examples
3. **Syntax** (30 seconds): Code breakdown with annotations
4. **Pitfalls** (30 seconds): Common mistakes highlighted
5. **Practice** (3-5 minutes): Guided exercises

**Writing Style**:
- Conversational, encouraging tone
- Short sentences (< 20 words)
- Active voice
- Real-world examples
- Visual metaphors

**AI Assistance**:
```bash
# Generate lesson content
/document "Python lists lesson" --persona-scribe=en --c7

# Review and improve lesson
/improve @content/worlds/world3/level21.json --persona-scribe=en
```

---

### Exercise Design Principles

**Exercise Types**:
1. **Fill-in-the-Blank**: User completes partial code
2. **Fix-the-Bug**: User corrects broken code
3. **Predict-Output**: User guesses what code prints
4. **Write-from-Scratch**: User writes complete solution
5. **Multiple-Choice**: User selects correct answer

**Difficulty Progression**:
- **Easy** (40%): Direct application of concept
- **Medium** (40%): Requires thinking or combining concepts
- **Hard** (20%): Creative problem-solving

**Test Case Guidelines**:
- Minimum 3 test cases per exercise
- Include edge cases
- 1-2 hidden test cases to prevent hardcoding
- Clear, helpful error messages

**AI Assistance**:
```bash
# Generate exercises for a concept
/implement "list slicing exercises" --persona-qa --validate

# Validate test cases
/test @content/worlds/world3/level22.json --persona-qa
```

---

## Flag Usage Guide

### Development Flags

**Planning & Analysis**:
```bash
--think           # Multi-file analysis (4K tokens)
--think-hard      # Deep architectural analysis (10K tokens)
--ultrathink      # Critical system redesign (32K tokens)
--plan            # Show execution plan before operations
```

**Efficiency & Compression**:
```bash
--uc              # Ultra-compressed output (30-50% reduction)
--answer-only     # Direct response without workflow
--validate        # Pre-operation validation and risk assessment
--safe-mode       # Maximum validation with conservative execution
```

**MCP Server Control**:
```bash
--c7              # Enable Context7 (library documentation)
--seq             # Enable Sequential (complex analysis)
--magic           # Enable Magic (UI component generation)
--play            # Enable Playwright (E2E testing)
--all-mcp         # Enable all MCP servers
```

**Persona Activation**:
```bash
--persona-architect    # System architecture specialist
--persona-frontend     # UX specialist, accessibility advocate
--persona-backend      # Reliability engineer, API specialist
--persona-qa           # Quality advocate, testing specialist
--persona-refactorer   # Code quality specialist
--persona-performance  # Optimization specialist
--persona-security     # Threat modeler, vulnerability specialist
--persona-scribe=en    # Professional writer, documentation specialist
```

**Scope & Focus**:
```bash
--scope [file|module|project|system]
--focus [performance|security|quality|architecture|accessibility]
```

---

### Recommended Flag Combinations

**Phase 1 (Foundation)**:
```bash
/analyze @. --persona-architect --think --c7 --validate
/implement "Pyodide integration" --persona-backend --seq --think-hard
```

**Phase 2 (Core Loop)**:
```bash
/build @components/code --persona-frontend --magic --c7
/test "exercise flow" --persona-qa --play --validate
```

**Phase 3 (Content)**:
```bash
/design "content loading system" --persona-architect --seq --think
/document @content/worlds/world1 --persona-scribe=en
```

**Phase 4 (Gamification)**:
```bash
/implement "achievement system" --persona-frontend --magic --seq
/improve @components/gamification --persona-performance --focus performance
```

**Phase 5 (Polish)**:
```bash
/improve @. --persona-refactorer --focus quality --validate
/cleanup --persona-refactorer --scope project
```

**Phase 6 (Deployment)**:
```bash
/analyze @. --persona-security --focus security --ultrathink
/git "prepare TestFlight build" --persona-devops --safe-mode
```

---

## Common Workflows

### Starting a New Session

```bash
# 1. Load project context
/load @.

# 2. Check current progress
/task list

# 3. Analyze current state
/analyze @. --scope project --uc

# 4. Pick next action from actions.md
# 5. Execute with appropriate persona and flags
```

---

### Implementing a New Feature

```bash
# 1. Design first (architectural thinking)
/design "daily challenge system" --persona-architect --think --plan

# 2. Implement with validation
/implement "daily challenge system" --persona-frontend --magic --validate

# 3. Test implementation
/test "daily challenge flow" --persona-qa --play

# 4. Review and refactor
/improve @app/(tabs)/index.tsx --persona-refactorer --focus quality
```

---

### Debugging Issues

```bash
# 1. Analyze with deep thinking
/troubleshoot "Pyodide not executing code" --seq --think-hard

# 2. Fix with validation
/improve @hooks/usePythonRunner.ts --validate --persona-backend

# 3. Verify fix
/test @hooks/usePythonRunner.ts --persona-qa

# 4. Document solution
/document "Pyodide troubleshooting" --persona-scribe=en
```

---

### Content Creation

```bash
# 1. Design lesson structure
/design "Python functions lesson" --persona-scribe=en --think

# 2. Create lesson content
/document @content/worlds/world4/level31.json --persona-scribe=en --c7

# 3. Generate exercises
/implement "function exercises with test cases" --persona-qa --validate

# 4. Review and polish
/improve @content/worlds/world4/level31.json --persona-scribe=en
```

---

## File Structure Reference

### Critical Paths

**Core Execution**:
```
assets/pyodide.html              → Pyodide WebView HTML
hooks/usePythonRunner.ts         → Python execution hook
components/code/PythonRunner.tsx → WebView wrapper
```

**State Management**:
```
stores/progressStore.ts          → User progress (Zustand)
stores/settingsStore.ts          → User settings (Zustand)
```

**Type Definitions**:
```
types/content.ts                 → Content types (World, Level, Exercise)
types/progression.ts             → Progress types (UserProgress, Achievement)
types/python.ts                  → Execution types (ExecutionResult)
```

**Content System**:
```
lib/contentLoader.ts             → JSON content loading
content/worlds/world*/           → World content (levels, challenges)
content/achievements.json        → Achievement definitions
```

**Testing & Validation**:
```
lib/testRunner.ts                → Test case execution
lib/xpCalculator.ts              → XP reward calculations
```

---

## Best Practices

### Do ✅

- **Use TypeScript strictly**: Enable all strict mode options
- **Validate before execution**: Use `--validate` flag for critical operations
- **Design before implementing**: Use `/design` for architectural decisions
- **Test continuously**: Write tests as you build, not after
- **Document as you go**: Use `--persona-scribe=en` for documentation
- **Use appropriate personas**: Match persona to task domain
- **Optimize with evidence**: Use `--focus performance` with metrics
- **Think deeply on complex problems**: Use `--think-hard` or `--ultrathink`
- **Leverage MCP servers**: Use `--c7`, `--seq`, `--magic`, `--play` appropriately

### Don't ❌

- **Skip type definitions**: Always define TypeScript interfaces
- **Ignore validation**: Don't skip `--validate` on critical operations
- **Premature optimization**: Optimize with evidence, not assumptions
- **Inconsistent patterns**: Follow established patterns in codebase
- **Hardcode values**: Use constants and configuration
- **Skip error handling**: Always handle edge cases
- **Forget offline-first**: App must work without network
- **Ignore mobile UX**: Consider touch targets, keyboard, small screens

---

## Troubleshooting

### Common Issues

**Pyodide Won't Load**:
```bash
/troubleshoot "Pyodide loading issues" --seq --think --persona-backend

# Check:
# 1. WebView configuration
# 2. Message handler setup
# 3. CDN availability (use local bundle if needed)
# 4. iOS WebView permissions
```

**State Not Persisting**:
```bash
/troubleshoot "Zustand persistence issues" --seq --persona-backend

# Check:
# 1. AsyncStorage permissions
# 2. Persist middleware configuration
# 3. State serialization
# 4. Rehydration logic
```

**Performance Issues**:
```bash
/analyze @. --focus performance --persona-performance --think

# Check:
# 1. Heavy re-renders (use React DevTools)
# 2. Large bundle size (analyze with Expo)
# 3. Memory leaks (check WebView cleanup)
# 4. Animation performance (use Reanimated profiler)
```

**Content Loading Fails**:
```bash
/troubleshoot "content loading errors" --seq --persona-backend

# Check:
# 1. JSON syntax validity
# 2. Type definition alignment
# 3. File path resolution
# 4. Error boundaries
```

---

## Resources

### Documentation

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Pyodide Documentation](https://pyodide.org/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/)
- [NativeWind Documentation](https://www.nativewind.dev/)

### AI-Assisted Learning

```bash
# Learn Expo patterns
/explain "Expo Router navigation" --persona-mentor --c7

# Learn Pyodide integration
/explain "Pyodide WebView messaging" --persona-mentor --seq --c7

# Learn state management
/explain "Zustand with persistence" --persona-mentor --c7
```

---

## Success Metrics

### Technical Metrics

- **Type Safety**: 100% TypeScript, no `any` types
- **Test Coverage**: ≥80% unit tests, ≥70% integration tests
- **Performance**: < 2s app launch, 60 FPS animations
- **Code Quality**: ESLint passing, no warnings
- **Bundle Size**: < 20MB total app size

### User Experience Metrics

- **Engagement**: Daily streak maintained
- **Learning**: Measurable Python skill improvement
- **Enjoyment**: Wanting to add more content
- **Reliability**: No crashes, smooth execution
- **Offline**: Full functionality without network

---

## Version History

**v1.0** - January 2025
- Initial specification
- 147-action build plan across 6 phases
- Complete technical architecture
- AI-native development framework

---

*This CLAUDE.md file is designed for AI-assisted development with Claude Code. Use the commands and patterns defined here to maximize development efficiency and code quality.*
