// frontend/src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Import getAuth for Firebase Authentication

// Your Firebase configuration.
// Ensure these environment variables are correctly set in frontend/.env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Omit/comment out if not present/needed for analytics
};

// Initialize Firebase App
// This checks if a Firebase app has already been initialized to prevent re-initialization errors
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get the Authentication service instance
// This is what you'll use to perform sign-in, sign-up, etc.
const auth = getAuth(app);

export { auth };
export default app;
