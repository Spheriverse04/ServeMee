// frontend/src/firebaseClient.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
// Add other Firebase imports you might need, e.g., getAuth, getFirestore, etc.

// Your web app's Firebase configuration
// !!! IMPORTANT: Replace with your actual Firebase project config !!!
const firebaseConfig = {
  apiKey: "AIzaSyD3ZN_r21knV3ybcCTSbmL9x9mybtdmHeQ",
  authDomain: "servemee-app.firebaseapp.com",
  projectId: "servemee-app",
  storageBucket: "servemee-app.firebasestorage.app",
  messagingSenderId: "752359927449",
  appId: "1:752359927449:web:c86862eb257697eab7d208"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
