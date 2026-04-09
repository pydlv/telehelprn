# Teletherapy

A React Native mobile application that connects patients with therapy providers, enabling appointment scheduling and live video sessions.

## Features

- **Two account types** — Patient (User) and Provider (Therapist)
- **Provider discovery** — Browse and select a therapy provider
- **Appointment scheduling** — View provider availability and request appointments
- **Video sessions** — In-app video calls powered by [OpenTok (Vonage)](https://www.vonage.com/communications-apis/video/)
- **Push notifications** — Appointment reminders and updates via FCM (Android) and APNS (iOS)
- **Profile management** — Edit personal details and upload a profile picture
- **Provider tools** — Manage availability schedules and accept/decline appointment requests
- **Account security** — Change password and email verification

## Tech Stack

| Area | Technology |
|---|---|
| Framework | React Native 0.63 |
| Language | JavaScript / TypeScript |
| State management | Redux + Redux Persist |
| Navigation | React Native Router Flux |
| UI components | React Native Elements |
| Video | OpenTok React Native |
| HTTP client | Axios |
| Push notifications | Firebase FCM (Android), APNS (iOS) |
| Error monitoring | Bugsnag |

## Prerequisites

- Node.js ≥ 12
- Yarn
- React Native CLI and its [environment setup](https://reactnative.dev/docs/environment-setup)
- Xcode (for iOS builds)
- Android Studio and Android SDK (for Android builds)

## Getting Started

### 1. Install dependencies

```bash
yarn install
```

The `postinstall` script automatically runs `patch-package` and `jetify` after installation.

### 2. Configure environment variables

The app uses [`react-native-config`](https://github.com/luggit/react-native-config) to manage environment-specific settings.

Copy or edit the environment files:

| File | Purpose |
|---|---|
| `.env.development` | Used during local development |
| `.env.production` | Used for production builds |

Each file should define:

```
ENV=development          # or "production"
API_HOST=http://127.0.0.1:8000
S3_HOST=<your-s3-host>
```

### 3. Start the Metro bundler

```bash
yarn start
```

### 4. Run the app

**Android**
```bash
yarn android
```

**iOS**
```bash
cd ios && pod install && cd ..
yarn ios
```

## Available Scripts

| Script | Description |
|---|---|
| `yarn start` | Start the Metro bundler |
| `yarn android` | Build and run on Android |
| `yarn ios` | Build and run on iOS |
| `yarn test` | Run Jest tests |
| `yarn lint` | Lint the codebase with ESLint |
| `yarn uploadMapsAndroid` | Upload Android source maps to Bugsnag |
| `yarn uploadMapsIOS` | Upload iOS source maps to Bugsnag |

## Project Structure

```
telehelprn/
├── Components/          # Screen and UI components
│   ├── HomeCards/       # Cards shown on the home screen
│   ├── Home.js          # Main home screen
│   ├── Login.js         # Authentication screens
│   ├── SignUp.js
│   ├── PasswordReset.js
│   ├── Settings.js      # User settings
│   ├── ProviderList.js  # Browse providers
│   ├── ProviderProfile.js
│   ├── AppointmentScheduler.js
│   ├── UpcomingAppointments.js
│   ├── PendingRequests.js  # Provider: review appointment requests
│   ├── VideoSession.js     # Live video call screen
│   └── ...
├── redux/
│   ├── actions.js       # Redux action creators
│   └── store.js         # Redux store and persistence config
├── api.ts               # REST API client
├── routes.js            # App navigation routes
├── consts.js            # Shared constants
├── strings.js           # UI strings
├── theme.js             # Global theme
├── globalStyles.js      # Shared styles
├── util.js              # Utility helpers
├── notifications.js     # Push notification setup
├── App.js               # Root component
└── index.js             # Entry point
```

## Testing

```bash
yarn test
```

Tests are located in the `__tests__/` directory and run with Jest using the `react-native` preset.

## Linting

```bash
yarn lint
```

ESLint is configured via `.eslintrc.js` using `@react-native-community/eslint-config`.

## Backend

This app communicates with a REST API. The base URL is set via `API_HOST` in the environment file. Key endpoints include user authentication, profile management, provider listing, appointment scheduling, and OpenTok session token retrieval.
