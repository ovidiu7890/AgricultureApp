# Firebase Authentication Setup Guide

## Step 1: Get Firebase Web Config

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (agriculturedb)
3. Click on the **Settings gear icon** → **Project settings**
4. Scroll down to **Your apps** section
5. If you don't have a web app, click **Add app** → **Web** (</>) icon
6. Register your app with a nickname (e.g., "AgriConnect Web")
7. Copy the `firebaseConfig` object

## Step 2: Update Firebase Configuration

Open `src/firebase.js` and replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_ACTUAL_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID", // Should be "agriculturedb" or similar
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 3: Enable Email/Password Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Email/Password**
3. Toggle **Enable** to ON
4. Click **Save**

## Step 4: Test the Authentication

1. Start the frontend: `npm run dev`
2. Navigate to `http://localhost:5173`
3. You should see the login page
4. Click "Sign up" to create a new account
5. After signup, you'll be redirected to the main forum page

## Features Implemented

✅ **Login Page** - Sign in with email and password  
✅ **Signup Page** - Create new account with email and password  
✅ **Protected Routes** - Unauthenticated users redirected to login  
✅ **Firebase Auth Integration** - Real authentication (no more mock user!)  
✅ **Automatic Login State** - Stays logged in on refresh  
✅ **Logout Functionality** - Sign out from navbar  
✅ **Error Handling** - User-friendly error messages  

## Security Notes

- Firebase API keys in the frontend are safe to expose (they're restricted by domain)
- User passwords are handled securely by Firebase (never sent to your backend)
- All sensitive operations are protected by Firebase Authentication rules

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure you've updated `src/firebase.js` with your actual Firebase config
- Verify that Email/Password authentication is enabled in Firebase Console

### "Firebase: Error (auth/api-key-not-valid)"
- Double-check your API key in `src/firebase.js`
- Make sure there are no extra spaces or quotes

### Still seeing the old mock user
- Hard refresh your browser (Ctrl+Shift+R)
- Clear browser cache
- Check browser console for errors
