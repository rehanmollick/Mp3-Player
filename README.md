# 🎵 React Native Audio Player

A native Android audio player built with React Native, demonstrating **cross-language bridging** between TypeScript and Java via React Native's Native Modules API.

## Why This Project Matters

This isn't just another React Native app. it showcases **native module development**, a skill needed when React Native's JavaScript layer can't access platform-specific APIs directly.

**Key Technical Highlights:**
- **Native Bridge Implementation** — Custom Java module exposes Android's MediaPlayer API to JavaScript
- **Cross-Language Communication** — TypeScript ↔ Java via React Native's bridge using Promises
- **Platform API Integration** — Direct access to Android's native audio capabilities
- **Type-Safe Architecture** — Full TypeScript implementation on the JS side

## Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                     JAVASCRIPT / TYPESCRIPT                   │
│  ┌─────────────────────┐      ┌─────────────────────────────┐ │
│  │ AudioPlayerScreen   │ ───► │ AudioPlayerModule.ts        │ │
│  │ (UI & State)        │      │ (Bridge Wrapper)            │ │
│  └─────────────────────┘      └──────────────┬──────────────┘ │
└──────────────────────────────────────────────┼────────────────┘
                                               │
                          ═══════════════════════════════════════
                                    NATIVE BRIDGE
                          ═══════════════════════════════════════
                                               │
┌──────────────────────────────────────────────┼────────────────┐
│                          JAVA / ANDROID                       │
│  ┌──────────────────────────────┐  ┌────────────────────────┐ │
│  │ AudioPlayerModule.java       │◄─┤ AudioPlayerPackage     │ │
│  │ • @ReactMethod annotations   │  │ (Registers module)     │ │
│  │ • MediaPlayer instance       │  └────────────────────────┘ │
│  │ • Promise-based responses    │                              │
│  └──────────────┬───────────────┘                              │
│                 ▼                                              │
│       ┌─────────────────────┐                                  │
│       │ Android MediaPlayer │                                  │
│       │ API (Native Audio)  │                                  │
│       └─────────────────────┘                                  │
└────────────────────────────────────────────────────────────────┘
```

## How the Native Bridge Works

### 1. Java Native Module (`AudioPlayerModule.java`)
Methods annotated with `@ReactMethod` become callable from JavaScript:
```java
@ReactMethod
public void play(String filePath, Promise promise) {
    mediaPlayer.start();
    promise.resolve("Playing");
}
```

### 2. Module Registration (`AudioPlayerPackage.java`)
Registers the module so React Native can find it:
```java
public List<NativeModule> createNativeModules(ReactApplicationContext ctx) {
    return Arrays.asList(new AudioPlayerModule(ctx));
}
```

### 3. TypeScript Bridge (`AudioPlayerModule.ts`)
Type-safe wrapper for the native methods:
```typescript
const { AudioPlayerModule } = NativeModules;
export default {
  play: (filePath: string): Promise<string> => AudioPlayerModule.play(filePath),
  // ...
};
```

### 4. UI Layer (`AudioPlayerScreen.tsx`)
Calls bridge methods and manages playback state with React hooks.

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI | React Native 0.82, TypeScript |
| Native Bridge | React Native Native Modules |
| Audio Engine | Android MediaPlayer API |
| Styling | React Native Linear Gradient |

## Setup Instructions

### Prerequisites
- **Node.js** 18+
- **Java** 17 (JDK)
- **Android Studio** with SDK & emulator configured
- **ADB** (comes with Android Studio)

### 1. Clone & Install
```bash
git clone https://github.com/rehanmollick/InterviewApp.git
cd InterviewApp
npm install
```

### 2. Start Metro Bundler
```bash
npx react-native start
```

### 3. Build & Run (in a new terminal)
```bash
./rebuild.sh
```
This builds the APK, installs it on the emulator, and launches the app.

### 4. Add an Audio File to Test
```bash
adb push ~/Music/sample.mp3 /sdcard/Download/sample.mp3
```
Then enter `sample.mp3` in the app's text field.

## Project Structure

```
├── App.tsx                    # App entry point
├── AudioPlayerScreen.tsx      # UI component (React)
├── AudioPlayerModule.ts       # JS → Native bridge wrapper
│
└── android/app/src/main/java/com/interviewapp/
    ├── AudioPlayerModule.java # Native audio logic
    ├── AudioPlayerPackage.java# Registers native module
    ├── MainActivity.kt        # Android entry point
    └── MainApplication.kt     # React Native configuration
```

## Scripts

| Command | Description |
|---------|-------------|
| `./rebuild.sh` | Build APK + install + restart (use after Java changes) |
| `./reload.sh` | Hot reload JS/TS changes (no rebuild needed) |

## License

MIT
