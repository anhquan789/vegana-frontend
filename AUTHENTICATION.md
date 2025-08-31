# Vegana Frontend - Authentication System

## 📋 Overview

This is a comprehensive authentication system built with Next.js 15, React 19, TypeScript, and Firebase. The system includes user registration, login, logout, password reset, and profile management with a proper enterprise-level project structure.

## 🚀 Features

### ✅ Authentication System
- **User Registration**: Create new accounts with email verification
- **User Login**: Secure login with email/password
- **User Logout**: Complete session termination
- **Password Reset**: Email-based password recovery
- **Profile Management**: Update user information
- **Protected Routes**: Route-level access control
- **Role-based Access Control**: Different user roles (admin, instructor, student)

### ✅ Technical Features
- **Firebase Integration**: Authentication, Firestore, Storage
- **Firebase Emulators**: Local development environment
- **TypeScript**: Full type safety
- **React Context**: Global authentication state
- **Form Validation**: Client-side validation with error handling
- **UI Components**: Reusable Input and Button components
- **Loading States**: User feedback during async operations
- **Error Handling**: Comprehensive error management

## 🏗️ Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── dashboard/               # Protected dashboard page
│   ├── login/                   # Login page
│   ├── register/                # Registration page
│   ├── unauthorized/            # Access denied page
│   ├── verify-email/           # Email verification page
│   └── layout.tsx              # Root layout with AuthProvider
├── components/
│   ├── common/
│   │   └── ProtectedRoute.tsx  # Route protection component
│   └── ui/
│       ├── Button.tsx          # Reusable button component
│       └── Input.tsx           # Reusable input component
├── contexts/
│   └── AuthContext.tsx         # Authentication context provider
├── lib/
│   ├── auth/
│   │   └── authService.ts      # Authentication service layer
│   └── firebase.ts             # Firebase configuration
├── types/
│   ├── auth.ts                 # Authentication type definitions
│   ├── course.ts               # Course type definitions
│   └── api.ts                  # API response types
├── constants/
│   ├── app.ts                  # Application constants
│   └── firebase.ts             # Firebase constants
└── utils/
    ├── date.ts                 # Date utilities
    ├── format.ts               # Formatting utilities
    └── helpers.ts              # General helper functions
```

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Setup
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Enable Storage
5. Get your Firebase config and update `src/lib/firebase.ts`

### 3. Environment Setup
Create a `.env.local` file:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Start Firebase Emulators (Optional)
```bash
firebase emulators:start
```

## 🎯 Usage

### Authentication Flow
1. **Registration**: Navigate to `/register` to create new account
2. **Email Verification**: Check email and verify account
3. **Login**: Navigate to `/login` to access your account
4. **Dashboard**: Access protected content at `/dashboard`
5. **Logout**: Use logout button to end session

### Available Routes
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Protected dashboard (requires authentication)
- `/verify-email` - Email verification page
- `/unauthorized` - Access denied page

## 🔒 Security Features

- **Email Verification**: Required for account activation
- **Password Validation**: Strong password requirements
- **Protected Routes**: Automatic redirect for unauthenticated users
- **Role-based Access**: Different access levels for different user types
- **Error Handling**: Secure error messages without sensitive data
- **Session Management**: Automatic token refresh and session validation

## 🛠️ Technical Stack

- **Frontend**: Next.js 15, React 19, TypeScript 5
- **Styling**: Tailwind CSS v4
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Storage**: Firebase Storage
- **State Management**: React Context
- **Form Handling**: Custom hooks with validation
- **Development**: Firebase Emulators

## 🚦 Development Notes

### Firebase Emulator Ports
- Auth Emulator: `http://localhost:9098`
- Firestore Emulator: `localhost:8081`
- Storage Emulator: `localhost:9198`
- Emulator UI: `http://localhost:4001`

### Code Quality
- Full TypeScript coverage
- ESLint configuration
- Comprehensive error handling
- Responsive design
- Accessibility considerations

## 🔄 Next Steps

1. **Email Templates**: Customize Firebase email templates
2. **Social Login**: Add Google, Facebook authentication
3. **Profile Pictures**: Upload and manage user avatars
4. **Password Policies**: Implement advanced password rules
5. **Two-Factor Auth**: Add 2FA security layer
6. **Admin Panel**: Build user management interface

## 📝 License

This project is part of the Vegana learning platform.

---

**Author**: Vegana Development Team  
**Version**: 1.0.0  
**Last Updated**: August 2025
