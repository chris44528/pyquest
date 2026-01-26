# PyQuest: Python Learning Game for iOS

A mobile-first Python learning game that transforms education into an engaging, gamified experience. Write real Python code that executes in-app, earn XP and achievements, and build genuine Python proficiency — all on your iPhone.

## ✨ Features

- **📱 Mobile-First**: Designed for iOS with smooth, native-feeling UX
- **🐍 Real Python**: Execute actual Python code via Pyodide (offline-capable)
- **🎮 Gamified Learning**: XP, achievements, streaks, and star ratings
- **📚 70 Levels**: 7 worlds covering Python fundamentals to practical application
- **🏆 Boss Challenges**: Multi-part projects at the end of each world
- **💾 Offline-First**: Everything works without internet after initial load
- **🎯 Multiple Exercise Types**: Fill-blank, fix-bug, predict-output, write-code, multiple-choice

## 🛠️ Tech Stack

- **Framework**: Expo SDK 52+ / React Native
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand with persistence
- **Code Execution**: Pyodide 0.26+ in WebView
- **Styling**: NativeWind (Tailwind for React Native)
- **Animations**: Reanimated 3
- **Storage**: AsyncStorage + expo-sqlite

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/chris44528/pyquest.git
cd pyquest

# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS simulator
npx expo start --ios
```

## 📖 Learning Path

### World 1: Foundations (Levels 1-10)
Variables, Data Types, Strings, Operators, Input/Output

### World 2: Control Flow (Levels 11-20)
Conditionals, Comparison & Logical Operators, Loops

### World 3: Data Structures (Levels 21-30)
Lists, Tuples, Dictionaries, Sets

### World 4: Functions (Levels 31-40)
Defining Functions, Parameters, Return Values, Scope, Lambda

### World 5: Working with Data (Levels 41-50)
File Concepts, JSON, List Comprehensions, Error Handling

### World 6: Object-Oriented Python (Levels 51-60)
Classes, Objects, Methods, Inheritance, Magic Methods

### World 7: Practical Python (Levels 61-70)
Modules, APIs (concepts), Regex, Datetime, Best Practices

## 🏗️ Project Structure

```
pyquest/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Tab navigation
│   ├── world/[worldId]/     # World and level screens
│   └── boss/                # Boss level screens
├── components/              # React components
│   ├── code/               # Code editor, console, Python runner
│   ├── lesson/             # Lesson content renderer
│   ├── exercise/           # Exercise components
│   └── gamification/       # XP, streaks, achievements
├── hooks/                   # Custom React hooks
├── stores/                  # Zustand state management
├── content/                 # Lesson and level JSON
├── lib/                     # Utilities (test runner, XP calculator)
├── types/                   # TypeScript type definitions
└── assets/                  # Images, fonts, Pyodide HTML
```

## 🤖 AI-Assisted Development

This project is designed for AI-native development with Claude Code. See **[CLAUDE.md](./CLAUDE.md)** for comprehensive AI-assisted development guidelines, including:

- Phase-by-phase development with persona recommendations
- Command examples for common workflows
- Architecture deep dives and patterns
- Flag usage guide for optimal AI assistance
- Content creation guidelines
- Troubleshooting guide

### Quick AI Commands

```bash
# Load project context
/load @.

# Analyze architecture
/analyze --scope project --focus architecture --persona-architect

# Implement new feature
/implement "daily challenge system" --persona-frontend --validate

# Create content
/document @content/worlds/world1 --persona-scribe=en

# Test and validate
/test --type e2e --persona-qa
```

## 📋 Development Plan

See **[actions.md](./actions.md)** for the complete 147-action build plan across 6 phases.

See **[spec.md](./spec.md)** for the complete technical specification.

### Phase Overview

- **Phase 1**: Foundation (Actions 1-28) - App shell with Pyodide
- **Phase 2**: Core Loop (Actions 29-58) - One playable level
- **Phase 3**: Content Structure (Actions 59-90) - Full World 1
- **Phase 4**: Gamification (Actions 91-115) - Rewards and engagement
- **Phase 5**: Polish (Actions 116-130) - Daily experience
- **Phase 6**: Content & Deploy (Actions 131-147) - All worlds + TestFlight

**Estimated Duration**: 6 weeks (evenings/weekends)

## 🧪 Testing

```bash
# Type checking
npx tsc --noEmit

# Run tests (when implemented)
npm test

# E2E tests with Claude Code
/test --type e2e --play --persona-qa
```

## 📝 Content Creation

Content is stored in JSON format in `content/worlds/`. Each level includes:

- Lesson content (markdown with code examples)
- Multiple exercise types with test cases
- Challenge problems with bonus objectives
- Common mistakes and explanations

Use `/document` command with `--persona-scribe=en` for AI-assisted content creation.

## 🎯 Success Metrics

### Technical
- Type Safety: 100% TypeScript coverage
- Test Coverage: ≥80% unit, ≥70% integration
- Performance: <2s app launch, 60 FPS animations
- Bundle Size: <20MB total

### User Experience
- Daily streak engagement
- Measurable skill improvement
- No crashes, smooth execution
- Full offline functionality

## 📄 License

Private project for personal use.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Python execution via [Pyodide](https://pyodide.org/)
- State management with [Zustand](https://docs.pmnd.rs/zustand/)
- AI-assisted development with [Claude Code](https://claude.ai/code)

---

**Status**: Planning Phase (Pre-Development)

**Next Steps**:
1. Initialize Expo project
2. Set up project structure
3. Integrate Pyodide
4. Build first level

See [CLAUDE.md](./CLAUDE.md) for detailed development guidance.
