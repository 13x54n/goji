# Goji - Crypto Trading App

A modern, dark-themed crypto trading app built with React Native and Expo.

## Features

- **Demo Authentication**: Mock Google and Apple Sign-In for Expo Go compatibility
- **Welcome Onboarding**: Beautiful splash screen for new users
- **Dark Theme**: Optimized for crypto trading with orange accent colors
- **5-Tab Navigation**: 
  - **Home**: Market overview, portfolio summary, quick actions
  - **Wallet**: Asset management, portfolio tracking
  - **Transactions**: Complete transaction history with filtering
  - **Earn**: Staking, DeFi opportunities, and earning rewards
  - **Profile**: User settings, portfolio summary, and logout

## Tech Stack

- React Native with Expo
- TypeScript
- Expo Router for navigation
- AsyncStorage for data persistence
- Google Sign-In & Apple Authentication
- Dark theme optimized for crypto trading

## Setup Instructions

### Prerequisites
- Node.js (v18 or later)
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. Install dependencies:
```bash
npm install
```

2. For iOS, install pods:
```bash
cd ios && pod install
```

3. Start the development server:
```bash
npm start
```

### Demo Authentication

This app uses **mock authentication** for demo purposes to ensure compatibility with Expo Go. The authentication buttons will create demo users with sample data.

#### For Production Setup
To implement real authentication, you would need to:

1. **Google Sign-In**: Set up Google Cloud Console project and configure OAuth credentials
2. **Apple Sign-In**: Enable Sign In with Apple in your Apple Developer account
3. Replace the mock authentication methods in `contexts/AuthContext.tsx` with real implementations

## Project Structure

```
app/
├── (tabs)/           # Main app tabs
│   ├── index.tsx     # Home tab
│   ├── wallet.tsx    # Wallet tab
│   ├── transactions.tsx # Transactions tab
│   ├── earn.tsx      # Earn tab
│   └── profile.tsx   # Profile tab
├── _layout.tsx       # Root layout with auth
└── welcome.tsx       # Welcome/onboarding screen

components/
├── WelcomeSplash.tsx # Welcome screen component
└── ui/               # Reusable UI components

contexts/
└── AuthContext.tsx   # Authentication state management

constants/
└── theme.ts          # Dark theme colors for crypto trading
```

## Key Features Implemented

✅ Demo authentication (Google & Apple mock)  
✅ Welcome splash screen for new users  
✅ Dark theme optimized for crypto trading  
✅ Bottom navigation with 5 tabs  
✅ Home tab with market data and portfolio  
✅ Wallet tab with asset management  
✅ Transactions tab with history and filtering  
✅ Earn tab with staking and DeFi opportunities  
✅ Profile tab with user settings and logout  
✅ Expo Go compatible (no native modules required)  

## Development

The app is configured for iOS and Android only (no web support as requested). The dark theme uses crypto-appropriate colors with orange accents and proper contrast for trading interfaces. The status bar is configured with light content on a dark background for optimal visibility.

## Next Steps

- Configure Google OAuth credentials
- Set up Apple Developer account for Apple Sign-In
- Add real crypto market data integration
- Implement actual trading functionality
- Add push notifications for price alerts
