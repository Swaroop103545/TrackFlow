# TrackFlow 🎵

> **Next-Gen Audio Production Workflow & Project Management Mobile Platform**

TrackFlow is an intuitive, feature-rich mobile application built with **React Native** and **Expo (SDK 57)** designed specifically for independent musicians, record producers, mix engineers, and project managers. It streamlines end-to-end audio production—from initial demo ideas and multitrack stem uploads to mixing/mastering checklists, AI production insights, and release dates.

---

![Expo SDK 57](https://img.shields.io/badge/Expo-v57.0-000000?style=flat-square&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-0.86.3-61DAFB?style=flat-square&logo=react&logoColor=black)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=flat-square&logo=react&logoColor=black)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.12.0-764ABC?style=flat-square&logo=redux&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)

---

## 🌟 Key Features

### 🎛️ 8-Stage Audio Production Workflow Pipeline
TrackFlow structures audio project lifecycles into 8 distinct workflow stages:
1. **Idea**: Conceptualize tracks, record initial acoustic/vocal memos, and set project parameters.
2. **Recording**: Track live instruments, vocals, and synth arrangements.
3. **Editing**: Quantize timing, pitch-correct vocals, clean up noise, and arrange stems.
4. **Mixing**: Balance volume, balance frequencies (EQ), control dynamics (compression), and add spatial effects.
5. **Mastering**: Final loudness normalization (-14 LUFS target), stereo enhancement, and final limiter checks.
6. **Artwork**: Design and assign release cover art and visual assets.
7. **Distribution**: Upload assets to digital service providers (DSPs) via distribution platforms.
8. **Release**: Marketing campaigns, launch day schedule, and streaming performance metrics.

---

### 🔊 Audio Stem & Version Management
- **Multi-Track Audio Uploads**: Easily pick and attach audio files (WAV, MP3, AAC, FLAC) per production stage using `expo-document-picker`.
- **Version Control Tagging**: Categorize tracks with custom labels such as `Demo`, `V1`, `V2`, `Stem`, `Rough Mix`, or `Final Master`.
- **Track Metadata**: Automatically measures and displays track size, MIME type, upload timestamp, and audio duration.

---

### 🎧 Integrated Audio Player & Global Persistent Player Bar
- **In-App Playback**: Embedded high-performance audio engine powered by `expo-av`.
- **Persistent Player (`GlobalAudioPlayerBar`)**: Listen to uploaded stems and mixes seamlessly while navigating between different tabs and project screens.
- **Scrubbing & Playback Controls**: Full controls for play, pause, progress scrubbing, and track selection.

---

### 📋 Stage-Specific Tasks & Checklist Management
- Create and assign tasks pinned to specific workflow stages (e.g., *"Tune lead vocal"*, *"Compress bass track"*, *"Export 24-bit WAV mix"*).
- Check off completed tasks to dynamically recalculate and update overall project progress percentage.

---

### 🤖 AI Sound Engine & Smart Recommendations
- Integrated **AI Production Service (`aiService`)** providing real-time, stage-aware advice:
  - Frequency spectrum checks during the **Mixing** stage.
  - Loudness target standards during **Mastering**.
  - Estimated task completion times and next recommended actions.

---

### 📊 Project Dashboard, Filtering & Search
- **Dashboard Overview**: Visual overview of active projects, overall completion rates, waveform indicators, and recent activity logs.
- **Advanced Filtering**: Instantly filter projects by production stage or musical genre (Pop, Rock, Hip-Hop, Electronic, R&B, Jazz, etc.).
- **Real-Time Search**: Search through projects by title, artist name, or genre.

---

### 📳 Haptic Feedback & Custom UI Theme System
- Integrated `expo-haptics` for tactile user responses on button interactions, stage progress changes, and audio play toggles.
- Modern visual aesthetics with soft gradients, glassmorphism elements, custom typography tokens, and responsive dark/light color palettes.

---

## 🛠️ Technology Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Expo (SDK 57)](https://expo.dev) | File-based routing via `expo-router` v57 |
| **Mobile Core** | [React Native 0.86](https://reactnative.dev) & [React 19](https://react.dev) | Cross-platform native application framework |
| **Language** | [TypeScript 6](https://www.typescriptlang.org/) | Strongly typed JavaScript |
| **State Management** | [Redux Toolkit](https://redux-toolkit.js.org/) & [React Redux](https://react-redux.js.org/) | Centralized store with Async Thunks & Slices |
| **Persistence** | [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | Local storage persistence for projects, tasks & tracks |
| **Audio Engine** | [`expo-av`](https://docs.expo.dev/versions/latest/sdk/av/) | Native audio playback and sound controls |
| **Document Picker** | [`expo-document-picker`](https://docs.expo.dev/versions/latest/sdk/document-picker/) | Native file system access for audio file uploads |
| **Icons & UI** | [`lucide-react-native`](https://lucide.dev) & [`expo-linear-gradient`](https://docs.expo.dev/versions/latest/sdk/linear-gradient/) | Modern vector icons and dynamic gradient containers |
| **Forms & Validation** | [Formik](https://formik.org/) & [Yup](https://github.com/jquense/yup) | Form handling and schema validation |
| **Haptics** | [`expo-haptics`](https://docs.expo.dev/versions/latest/sdk/haptics/) | Physical haptic engine feedback |

---

## 📁 Project Architecture

```
TrackFlow/
├── app/                        # Expo Router File-Based Routing
│   ├── (tabs)/                 # Main Tab Navigation
│   │   ├── _layout.tsx         # Bottom Tab Bar layout & persistent Audio Player
│   │   ├── index.tsx           # Creative Studio Dashboard & AI Recommendations
│   │   ├── projects/           # Projects list & filter screen
│   │   └── settings.tsx        # App Settings & preferences
│   ├── projects/               # Dynamic Project Detail Routes
│   │   ├── [id].tsx            # Project detail view (Pipeline, Tasks, Audio Stems)
│   │   └── create.tsx          # Create new project modal form (Formik + Yup)
│   └── _layout.tsx             # Root layout with Redux Provider & Safe Area context
│
├── src/                        # Main Source Code Directory
│   ├── components/             # Reusable UI Components
│   │   ├── AudioPlayerList.tsx     # Audio track list with inline playback controls
│   │   ├── AudioUploadModal.tsx    # File picker modal for uploading audio stems
│   │   ├── GlobalAudioPlayerBar.tsx # Persistent floating audio playback toolbar
│   │   ├── CalendarModal.tsx       # Date picker calendar modal
│   │   ├── Avatar.tsx              # User profile avatar component
│   │   ├── Button.tsx              # Standardized custom action button
│   │   ├── Card.tsx                # Flexible surface card container
│   │   └── EmptyState.tsx          # Placeholder display for empty lists
│   ├── hooks/                  # Custom React Hooks
│   │   └── useTheme.ts             # Theme context hook
│   ├── services/               # Application Services & Business Logic
│   │   ├── aiService.ts            # AI recommendation engine
│   │   ├── audioPlaybackService.ts # `expo-av` sound instance lifecycle manager
│   │   ├── audioService.ts         # Audio metadata & CRUD handling
│   │   ├── projectService.ts       # Project storage & calculations
│   │   └── taskService.ts          # Task progress recalculation logic
│   ├── store/                  # Redux State Management
│   │   ├── store.ts               # Redux store configuration & RootState types
│   │   └── slices/                # State Slices
│   │       ├── audioSlice.ts          # Audio playback & track state
│   │       ├── authSlice.ts           # User session & profile state
│   │       ├── notificationSlice.ts   # System alert & notification state
│   │       ├── projectSlice.ts        # Projects CRUD & active selection
│   │       └── taskSlice.ts           # Project tasks state
│   ├── theme/                  # Design System Tokens
│   │   ├── colors.ts              # Color palettes (Light / Dark modes)
│   │   ├── spacing.ts             # Spacing constants (padding, margins)
│   │   ├── typography.ts          # Font weights, sizes, line heights
│   │   └── theme.ts               # Theme theme aggregate
│   ├── types/                  # TypeScript Data Models & Contracts
│   │   └── index.ts               # Core entities (Project, Task, AudioTrack, etc.)
│   └── utils/                  # Utility Functions
│       ├── haptics.ts             # Expo Haptics wrapper utilities
│       └── projectValidation.ts   # Yup validation schema for project creation
│
├── assets/                     # Application Icons & Images
├── app.json                    # Expo configuration manifest
├── package.json                # Node dependencies and npm scripts
└── tsconfig.json               # TypeScript compiler config
```

---

## ⚡ Quick Start Guide

### Prerequisites
Before running TrackFlow, ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go App](https://expo.dev/go) on your mobile device (iOS or Android), OR an iOS Simulator / Android Emulator.

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/TrackFlow.git
   cd TrackFlow
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Expo Development Server**:
   ```bash
   npm start
   ```
   *or using Expo CLI directly:*
   ```bash
   npx expo start
   ```

4. **Launch on Target Platform**:
   - **iOS Simulator**: Press `i` in the terminal or run `npm run ios`.
   - **Android Emulator**: Press `a` in the terminal or run `npm run android`.
   - **Web Browser**: Press `w` in the terminal or run `npm run web`.
   - **Physical Device**: Scan the QR code displayed in the terminal using the Expo Go app.

---

## 📜 Available NPM Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `start` | `expo start` | Starts the interactive Expo dev server |
| `android` | `expo start --android` | Launches the project on a connected Android device/emulator |
| `ios` | `expo start --ios` | Launches the project on an iOS Simulator |
| `web` | `expo start --web` | Runs the project web version in a web browser |

---

## 🧠 Core Data Architecture

```typescript
export type WorkflowStage =
  | 'Idea'
  | 'Recording'
  | 'Editing'
  | 'Mixing'
  | 'Mastering'
  | 'Artwork'
  | 'Distribution'
  | 'Release';

export interface Project {
  id: string;
  name: string;
  artistId: string;
  genre: string;
  description?: string;
  releaseDate: string; // ISO String
  currentStage: WorkflowStage;
  progress: number;    // 0-100%
  createdAt: number;
  updatedAt: number;
}

export interface AudioTrack {
  id: string;
  projectId: string;
  name: string;
  fileUri: string;
  fileName: string;
  fileSize: number;
  mimeType?: string;
  duration?: number;
  stage: WorkflowStage;
  versionLabel?: string; // "Demo", "V1", "V2", "Stem", "Master"
  uploadedAt: number;
}
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check out the [Issues](../../issues) tab to report bugs or submit pull requests.

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---