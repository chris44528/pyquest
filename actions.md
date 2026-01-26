# PyQuest: Complete Build Actions List

**Total Actions: 147**
**Estimated Duration: 6 weeks (evenings/weekends)**

---

## Phase 1: Foundation (Actions 1-28)
*Goal: App shell with Pyodide executing Python code*

### Project Setup (Actions 1-8)

- [ ] **1.** Create new Expo project: `npx create-expo-app pyquest --template tabs`
- [ ] **2.** Navigate into project: `cd pyquest`
- [ ] **3.** Install core dependencies:
  ```bash
  npx expo install expo-router react-native-webview expo-haptics expo-secure-store @react-native-async-storage/async-storage
  ```
- [ ] **4.** Install Zustand for state management: `npm install zustand`
- [ ] **5.** Install NativeWind for styling: `npm install nativewind tailwindcss` and configure
- [ ] **6.** Install dev dependencies: `npm install -D @types/react typescript`
- [ ] **7.** Create folder structure:
  ```
  mkdir -p components/{code,lesson,exercise,gamification,ui}
  mkdir -p hooks stores content/worlds lib types assets
  ```
- [ ] **8.** Run app to verify setup: `npx expo start` — confirm it loads on iOS simulator

### TypeScript Types (Actions 9-14)

- [ ] **9.** Create `types/content.ts` — Define World, Level, Exercise, TestCase interfaces
- [ ] **10.** Create `types/progression.ts` — Define UserProgress, LevelProgress, Achievement interfaces
- [ ] **11.** Create `types/index.ts` — Export all types
- [ ] **12.** Create `types/python.ts` — Define ExecutionResult, PythonMessage interfaces
- [ ] **13.** Add type for exercise variants: FillBlank, FixBug, PredictOutput, WriteCode, MultipleChoice
- [ ] **14.** Verify TypeScript compiles with no errors: `npx tsc --noEmit`

### Pyodide Integration (Actions 15-22)

- [ ] **15.** Create `assets/pyodide.html` — WebView HTML with Pyodide loader script
- [ ] **16.** Add Pyodide initialization code to HTML (loadPyodide, stdout capture)
- [ ] **17.** Add message handler to HTML for receiving code from React Native
- [ ] **18.** Add timeout protection logic (5 second default)
- [ ] **19.** Add infinite loop detection wrapper
- [ ] **20.** Create `hooks/usePythonRunner.ts` — Hook to manage WebView ref and messaging
- [ ] **21.** Create `components/code/PythonRunner.tsx` — WebView component wrapper
- [ ] **22.** Test: Create temp screen, run `print("Hello")`, verify output returns

### State Management (Actions 23-26)

- [ ] **23.** Create `stores/progressStore.ts` — Zustand store with persist middleware
- [ ] **24.** Add actions: updateXP, completeExercise, completeLevel, updateStreak
- [ ] **25.** Create `stores/settingsStore.ts` — Theme, haptics, notifications preferences
- [ ] **26.** Test: Verify state persists across app restart

### Basic Navigation (Actions 27-28)

- [ ] **27.** Set up Expo Router tab layout with three tabs: Home, Worlds, Profile
- [ ] **28.** Create placeholder screens for each tab with basic UI

**✓ Phase 1 Complete Checkpoint:** App runs, can execute Python code via Pyodide, state persists

---

## Phase 2: Core Loop (Actions 29-58)
*Goal: One complete playable level end-to-end*

### Code Editor Component (Actions 29-35)

- [ ] **29.** Create `components/code/CodeEditor.tsx` — Basic TextInput with monospace font
- [ ] **30.** Add line numbers display (calculated from content)
- [ ] **31.** Add syntax highlighting (basic: keywords, strings, comments) — or use simple color scheme
- [ ] **32.** Handle keyboard avoidance properly for iOS
- [ ] **33.** Add "Run" button that triggers code execution
- [ ] **34.** Create `components/code/Console.tsx` — Output display component
- [ ] **35.** Style console with stdout (white), stderr (red), result (green) colors

### Lesson Content Renderer (Actions 36-42)

- [ ] **36.** Install markdown renderer: `npm install react-native-markdown-display`
- [ ] **37.** Create `components/lesson/LessonContent.tsx` — Main lesson renderer
- [ ] **38.** Create `components/lesson/CodeBlock.tsx` — Styled code examples with copy button
- [ ] **39.** Create `components/lesson/Callout.tsx` — Info/warning/tip boxes
- [ ] **40.** Add support for annotations on code (line highlights)
- [ ] **41.** Add "Common Mistakes" collapsible section
- [ ] **42.** Test: Render sample lesson markdown, verify all elements display

### Exercise Components (Actions 43-52)

- [ ] **43.** Create `components/exercise/ExerciseCard.tsx` — Wrapper with prompt, hints, submit
- [ ] **44.** Create `components/exercise/FillBlank.tsx` — Code with `_____` placeholders user fills
- [ ] **45.** Create `components/exercise/FixBug.tsx` — Buggy code user must correct
- [ ] **46.** Create `components/exercise/PredictOutput.tsx` — Show code, user types expected output
- [ ] **47.** Create `components/exercise/WriteCode.tsx` — Blank editor, user writes from scratch
- [ ] **48.** Create `components/exercise/MultipleChoice.tsx` — Question with selectable answers
- [ ] **49.** Add hint system: Button reveals hints progressively, tracks hints used
- [ ] **50.** Add "Show Solution" button (available after 3 failed attempts)
- [ ] **51.** Create `lib/testRunner.ts` — Compare output against expected, handle regex patterns
- [ ] **52.** Test: Each exercise type works, test cases validate correctly

### Level Flow (Actions 53-58)

- [ ] **53.** Create `app/world/[worldId]/level/[levelId]/index.tsx` — Main level screen
- [ ] **54.** Implement level state machine: lesson → exercises (1..n) → challenge → complete
- [ ] **55.** Add progress bar showing current position in level
- [ ] **56.** Create `app/world/[worldId]/level/[levelId]/challenge.tsx` — Challenge mode UI
- [ ] **57.** Create `app/world/[worldId]/level/[levelId]/complete.tsx` — Completion screen
- [ ] **58.** Wire up XP awards on exercise/level completion

**✓ Phase 2 Complete Checkpoint:** Can play through one level: read lesson, do exercises, complete challenge, see XP

---

## Phase 3: Content Structure (Actions 59-85)
*Goal: Full World 1 playable with 10 levels*

### Content Loading System (Actions 59-64)

- [ ] **59.** Create `lib/contentLoader.ts` — Functions to load world/level JSON
- [ ] **60.** Define JSON schema validation (or trust TypeScript types)
- [ ] **61.** Create `content/worlds/world1/index.json` — World 1 metadata
- [ ] **62.** Create content loading hook: `hooks/useLevel.ts`
- [ ] **63.** Create content loading hook: `hooks/useWorld.ts`
- [ ] **64.** Add error boundaries for missing/malformed content

### World Map Screen (Actions 65-70)

- [ ] **65.** Design World Map UI — vertical scrolling path with world nodes
- [ ] **66.** Implement `app/(tabs)/worlds.tsx` with world cards
- [ ] **67.** Show world status: locked, available, in-progress, completed
- [ ] **68.** Add world completion percentage indicator
- [ ] **69.** Add visual connection lines between worlds
- [ ] **70.** Animate unlocking when previous world completed

### Level Selection (Actions 71-76)

- [ ] **71.** Create `app/world/[worldId]/index.tsx` — World detail screen
- [ ] **72.** Display levels in grid (2 columns) or list
- [ ] **73.** Show level status: locked, available, completed + star rating
- [ ] **74.** Implement level unlock logic (previous level must be completed)
- [ ] **75.** Add boss level special styling (larger, different color)
- [ ] **76.** Navigate to level on tap

### Progress Tracking (Actions 77-80)

- [ ] **77.** Save exercise completion to progress store
- [ ] **78.** Calculate and save star rating on level complete
- [ ] **79.** Track best time per level
- [ ] **80.** Persist last submission code for each exercise (for retry)

### World 1 Content Creation (Actions 81-85)

- [ ] **81.** Create Level 1: Variables & Assignment (`content/worlds/world1/level1.json`)
- [ ] **82.** Create Level 2: Data Types (int, float, str, bool)
- [ ] **83.** Create Level 3: Strings & String Methods
- [ ] **84.** Create Level 4: Basic Operators (+, -, *, /, //, %, **)
- [ ] **85.** Create Level 5: Input/Output (print, concepts of input)
- [ ] **86.** Create Level 6: String Formatting (f-strings, .format())
- [ ] **87.** Create Level 7: Type Conversion (int(), str(), float())
- [ ] **88.** Create Level 8: String Slicing
- [ ] **89.** Create Level 9: Basic String Methods (.upper(), .lower(), .strip(), etc.)
- [ ] **90.** Create Level 10 (Boss): Mad Libs Generator project

**✓ Phase 3 Complete Checkpoint:** World 1 fully playable, progress saves, levels unlock sequentially

---

## Phase 4: Gamification (Actions 91-115)
*Goal: Feels like a game with rewards and progression*

### XP System (Actions 91-95)

- [ ] **91.** Create `lib/xpCalculator.ts` — Calculate XP for various actions
- [ ] **92.** Create `components/gamification/XPCounter.tsx` — Animated XP display
- [ ] **93.** Add XP gain animation (numbers floating up)
- [ ] **94.** Show XP breakdown on level complete (exercise XP + bonuses)
- [ ] **95.** Display total XP in header/profile

### Streak System (Actions 96-100)

- [ ] **96.** Implement streak calculation logic in progressStore
- [ ] **97.** Create `components/gamification/StreakBadge.tsx` — Fire icon with count
- [ ] **98.** Add streak bonus XP (multiplier based on streak length)
- [ ] **99.** Show streak freeze warning if about to lose streak
- [ ] **100.** Add streak milestone celebrations (7 days, 30 days, etc.)

### Star Rating (Actions 101-103)

- [ ] **101.** Create `components/gamification/StarRating.tsx` — 1-3 stars display
- [ ] **102.** Implement star calculation: based on hints used, attempts, time
- [ ] **103.** Add star animation on level complete

### Achievements (Actions 104-110)

- [ ] **104.** Create `content/achievements.json` — All achievement definitions
- [ ] **105.** Create `hooks/useAchievements.ts` — Check conditions, unlock achievements
- [ ] **106.** Create `components/gamification/AchievementPopup.tsx` — Unlock notification
- [ ] **107.** Implement progress achievements (first exercise, first level, first world)
- [ ] **108.** Implement streak achievements (7 day, 30 day, 100 day)
- [ ] **109.** Implement skill achievements (no hints, first try, speed)
- [ ] **110.** Implement secret achievements (night owl, speed demon)

### Celebration Screens (Actions 111-115)

- [ ] **111.** Polish `level/complete.tsx` — Stars animation, XP breakdown, achievement display
- [ ] **112.** Add confetti/particle effect on 3-star completion
- [ ] **113.** Add haptic feedback on achievements and level complete
- [ ] **114.** Create world complete celebration (bigger, more dramatic)
- [ ] **115.** Add sound effects (optional, respect settings)

**✓ Phase 4 Complete Checkpoint:** XP, streaks, stars, achievements all working, feels rewarding

---

## Phase 5: Polish & Home Screen (Actions 116-130)
*Goal: Polished daily experience*

### Home Screen (Actions 116-122)

- [ ] **116.** Design Home screen layout — greeting, continue learning, daily challenge
- [ ] **117.** Implement "Continue Learning" card — shows current level progress
- [ ] **118.** Implement Daily Challenge system — random exercise, bonus XP
- [ ] **119.** Show recent achievements on home
- [ ] **120.** Add time-based greeting (Good morning/afternoon/evening)
- [ ] **121.** Show streak prominently with visual flair
- [ ] **122.** Add quick stats summary (levels completed, total XP)

### Profile Screen (Actions 123-127)

- [ ] **123.** Design Profile screen — stats, achievements, settings access
- [ ] **124.** Display all stats: XP, levels, exercises, time spent, streaks
- [ ] **125.** Show achievements grid with locked/unlocked state
- [ ] **126.** Add achievement detail modal on tap
- [ ] **127.** Add "Share Progress" functionality (screenshot or text)

### Settings (Actions 128-130)

- [ ] **128.** Create `app/settings.tsx` — Settings screen
- [ ] **129.** Add toggles: haptics, sounds, notifications
- [ ] **130.** Add reset progress option (with confirmation)

**✓ Phase 5 Complete Checkpoint:** Complete polished UI, daily engagement features working

---

## Phase 6: Content & Deployment (Actions 131-147)
*Goal: All content, ready for TestFlight*

### Remaining World Content (Actions 131-137)

- [ ] **131.** Create World 2: Control Flow (10 levels) — if/elif/else, loops
- [ ] **132.** Create World 3: Data Structures (10 levels) — lists, dicts, tuples, sets
- [ ] **133.** Create World 4: Functions (10 levels) — def, params, return, scope, lambda
- [ ] **134.** Create World 5: Working with Data (10 levels) — JSON, comprehensions, try/except
- [ ] **135.** Create World 6: OOP (10 levels) — classes, inheritance, methods
- [ ] **136.** Create World 7: Practical Python (10 levels) — modules, regex, datetime
- [ ] **137.** Create all Boss Levels with multi-part projects

### Onboarding (Actions 138-140)

- [ ] **138.** Create `app/onboarding.tsx` — First-time user flow
- [ ] **139.** Add welcome screens explaining the app
- [ ] **140.** Add optional "What's your experience level?" to customize start

### Final Polish (Actions 141-144)

- [ ] **141.** Create app icon (1024x1024)
- [ ] **142.** Create splash screen
- [ ] **143.** Performance audit — optimize slow screens
- [ ] **144.** Test full flow on physical device

### Deployment (Actions 145-147)

- [ ] **145.** Configure `app.json` with bundle ID, version, etc.
- [ ] **146.** Build for iOS: `eas build --platform ios`
- [ ] **147.** Submit to TestFlight for personal use

**✓ Phase 6 Complete Checkpoint:** Full app with all content, running on your phone via TestFlight

---

## Quick Reference: Key Files to Create

### Must-Have Files (Core Functionality)
```
assets/pyodide.html
hooks/usePythonRunner.ts
components/code/PythonRunner.tsx
components/code/CodeEditor.tsx
components/code/Console.tsx
stores/progressStore.ts
lib/testRunner.ts
lib/contentLoader.ts
types/content.ts
types/progression.ts
```

### Content Files (Per World)
```
content/worlds/world1/index.json
content/worlds/world1/level1.json
content/worlds/world1/level2.json
... (10 levels per world)
content/achievements.json
```

---

## Progress Tracker

| Phase | Actions | Status |
|-------|---------|--------|
| Phase 1: Foundation | 1-28 | ⬜ Not Started |
| Phase 2: Core Loop | 29-58 | ⬜ Not Started |
| Phase 3: Content Structure | 59-90 | ⬜ Not Started |
| Phase 4: Gamification | 91-115 | ⬜ Not Started |
| Phase 5: Polish | 116-130 | ⬜ Not Started |
| Phase 6: Content & Deploy | 131-147 | ⬜ Not Started |

**Total Progress: 0/147 actions complete**

---

## Session Planning

Each coding session, pick 3-5 actions to complete. Suggested groupings:

**Session 1 (1hr):** Actions 1-8 — Project setup
**Session 2 (1hr):** Actions 9-14 — TypeScript types
**Session 3 (2hr):** Actions 15-22 — Pyodide integration (the tricky bit)
**Session 4 (1hr):** Actions 23-28 — State + navigation
**Session 5 (2hr):** Actions 29-35 — Code editor
**Session 6 (1.5hr):** Actions 36-42 — Lesson renderer
**Session 7 (2hr):** Actions 43-52 — Exercise components
**Session 8 (1.5hr):** Actions 53-58 — Level flow

...and so on.

---

*Actions list v1.0 — January 2025*