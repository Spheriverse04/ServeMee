// frontend/src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Import getAuth for Firebase Authentication

// Your Firebase configuration.
// Using hardcoded values for now - in production, use environment variables
const firebaseConfig = {
  apiKey: "AIzaSyD3ZN_r21knV3ybcCTSbmL9x9mybtdmHeQ",
  authDomain: "servemee-app.firebaseapp.com",
  projectId: "servemee-app",
  storageBucket: "servemee-app.firebasestorage.app",
  messagingSenderId: "752359927449",
  appId: "1:752359927449:web:c86862eb257697eab7d208"
};

// Initialize Firebase App
// This checks if a Firebase app has already been initialized to prevent re-initialization errors
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get the Authentication service instance
// This is what you'll use to perform sign-in, sign-up, etc.
const auth = getAuth(app);

export { auth };
export default app;