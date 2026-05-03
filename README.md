# FitPro Mobile — React Native (Expo) App
## Complete Step-by-Step Setup Guide

---

## Project structure

```
fitpro-mobile/
├── App.js                          ← Entry point, fonts, providers
├── app.json                        ← Expo config
├── babel.config.js                 ← Babel + Reanimated plugin
├── package.json
└── src/
    ├── api/
    │   ├── axios.js                ← Axios instance + JWT interceptors
    │   └── services.js             ← All API calls
    ├── components/
    │   └── index.js                ← GradientButton, Input, Card, Badge…
    ├── context/
    │   └── AuthContext.js          ← Login/logout/register state
    ├── navigation/
    │   └── index.js                ← Stack + Tab navigators
    ├── screens/
    │   ├── Auth/
    │   │   ├── SplashScreen.js
    │   │   ├── WelcomeScreen.js
    │   │   ├── LoginScreen.js
    │   │   ├── RegisterScreen.js
    │   │   └── OnboardingScreen.js
    │   └── Main/
    │       ├── HomeScreen.js
    │       ├── WorkoutsScreen.js
    │       ├── WorkoutDetailScreen.js
    │       ├── LogActivityScreen.js
    │       ├── ProgressScreen.js
    │       └── ProfileScreen.js
    └── theme/
        └── index.js                ← Colors, fonts, spacing, shadows
```

---

## STEP 1 — Install prerequisites

### Node.js v18+
https://nodejs.org

### Expo CLI
```bash
npm install -g expo-cli
```

### EAS CLI (for device builds)
```bash
npm install -g eas-cli
```

---

## STEP 2 — Install dependencies

```bash
cd fitpro-mobile
npm install
```

### All packages explained

| Package | Purpose |
|---|---|
| expo ~51 | Expo SDK — managed workflow |
| react-native 0.74 | Core mobile framework |
| @react-navigation/native | Navigation container |
| @react-navigation/native-stack | Screen stack navigator |
| @react-navigation/bottom-tabs | Bottom tab bar |
| react-native-screens | Native screen optimization |
| react-native-safe-area-context | Safe area insets |
| react-native-gesture-handler | Touch/swipe gestures |
| react-native-reanimated | Smooth animations |
| expo-font | Load custom fonts |
| expo-splash-screen | Control splash screen |
| expo-linear-gradient | Gradient backgrounds/buttons |
| @expo-google-fonts/nunito | Nunito font family |
| @react-native-async-storage/async-storage | JWT token storage |
| axios | HTTP client |
| react-native-chart-kit | Line/bar charts |
| react-native-svg | SVG support for charts |
| @expo/vector-icons | Ionicons icon set |
| react-native-toast-message | Toast notifications |

---

## STEP 3 — Set up your API URL

Open `src/api/axios.js` and set the correct `BASE_URL`:

```js
// Android emulator → points to your machine's localhost
const BASE_URL = 'http://10.0.2.2:5000/api';

// iOS Simulator
const BASE_URL = 'http://localhost:5000/api';

// Physical device (find your machine's LAN IP)
const BASE_URL = 'http://192.168.1.X:5000/api';
```

To find your LAN IP:
- Windows: run `ipconfig` → IPv4 Address
- Mac/Linux: run `ifconfig` or `ip addr`

---

## STEP 4 — Make sure backend is running

```bash
cd fitpro-backend
npm run dev
# Server: http://localhost:5000
# Seed if needed: npm run fix-passwords
```

---

## STEP 5 — Run the app

### On Android emulator (Android Studio required)
```bash
npm run android
```

### On iOS simulator (Mac + Xcode required)
```bash
npm run ios
```

### On physical device with Expo Go app
```bash
npm start
# Scan the QR code with Expo Go (iOS) or Camera (Android)
```

---

## STEP 6 — Test login credentials

After running `npm run fix-passwords` on the backend:

| Role | Email | Password |
|---|---|---|
| User | ayesha@fitpro.com | user123 |
| User | bilal@fitpro.com | user123 |
| (any sample user) | X@fitpro.com | user123 |

---

## Design system

### Font — Nunito
Loaded from Google Fonts via `@expo-google-fonts/nunito`.

| Token | Weight | Usage |
|---|---|---|
| FONTS.light | 300 | De-emphasized text |
| FONTS.regular | 400 | Body copy |
| FONTS.medium | 500 | Captions |
| FONTS.semiBold | 600 | Labels, nav |
| FONTS.bold | 700 | Buttons, headings |
| FONTS.extraBold | 800 | Stat numbers |
| FONTS.black | 900 | Hero titles, logo |

### Color palette (dark athletic theme)
```
Primary (teal):     #00E5A0  — main CTA, active states
Secondary (orange): #FF6B35  — accent, warnings
Background:         #0F2027  — deepest dark
Surface:            #162530  — cards
Surface2:           #1E3040  — inputs, elevated
TextPrimary:        #F0F4F8  — headings
TextSecondary:      #8FA8BE  — body
TextMuted:          #4D6A80  — placeholders
```

---

## Screen guide

### Auth screens
| Screen | What it does |
|---|---|
| SplashScreen | App logo on launch |
| WelcomeScreen | Hero + Get Started / Sign In |
| LoginScreen | Email + password with validation |
| RegisterScreen | Name, email, password + confirm |
| OnboardingScreen | 3-step goal/level/sessions picker |

### Main screens (tab bar)
| Screen | Tab | What it does |
|---|---|---|
| HomeScreen | Home | Greeting, today's plan card, stats, quick actions |
| WorkoutsScreen | Workouts | Browse plans, filter by type, AI Pick button |
| WorkoutDetailScreen | (modal) | Exercises list, booking button |
| LogActivityScreen | Log | Log steps/workout/run with type + duration |
| ProgressScreen | Progress | Charts, stats, achievements |
| ProfileScreen | Profile | Edit info, settings, logout |

---

## STEP 7 — Build for production

### Android APK (for testing)
```bash
eas build -p android --profile preview
```

### Android Play Store
```bash
eas build -p android --profile production
```

### iOS App Store (Mac + Apple account required)
```bash
eas build -p ios --profile production
```

Configure `eas.json`:
```json
{
  "build": {
    "preview": {
      "android": { "buildType": "apk" }
    },
    "production": {}
  }
}
```

---

## Common errors & fixes

### Metro bundler can't find module
```bash
npx expo start --clear
```

### Reanimated not working
Make sure `babel.config.js` has `react-native-reanimated/plugin` as the LAST plugin.

### Fonts not loading
Check that `@expo-google-fonts/nunito` is installed and the font names in `App.js` exactly match what you import.

### Can't connect to backend on device
Use your machine's LAN IP in `axios.js`, not `localhost`. Make sure both device and machine are on the same Wi-Fi network.

### AsyncStorage warning
If you see a warning about AsyncStorage being moved, make sure you're importing from `@react-native-async-storage/async-storage`, not from `react-native` directly.
