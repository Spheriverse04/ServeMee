// frontend/src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase'; // Import auth
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Import Firebase auth functions

interface UserInfo {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        });
        // You might still keep the token in localStorage for backend calls,
        // but onAuthStateChanged is the primary way to check auth status on frontend.
        console.log('User detected by onAuthStateChanged:', firebaseUser.uid);
      } else {
        // User is signed out
        console.log('No Firebase user detected. Redirecting to auth page.');
        setUser(null);
        localStorage.removeItem('firebaseIdToken'); // Clear token on logout
        localStorage.removeItem('currentUserUid');
        router.push('/auth/email-password'); // Redirect to your new auth page
      }
      setLoading(false);
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      console.log('Firebase logout successful!');
      // onAuthStateChanged will handle the redirection after signOut
    } catch (error) {
      console.error('Error during Firebase logout:', error);
      setLoading(false);
      alert('Failed to log out. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Loading user state...</p>
      </div>
    );
  }

  if (!user) {
    // If not loading and no user, it means onAuthStateChanged redirected or is about to.
    return null; // Or a simple message like "Access Denied, Redirecting..."
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to your Dashboard, {user.displayName || user.email}!
        </h2>
        <p className="text-gray-600 mb-2">UID: {user.uid}</p>
        <p className="text-green-600 font-semibold mb-8">
          You are now authenticated via Firebase Email/Password.
        </p>
        <button
          onClick={handleLogout}
          className="w-full sm:w-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          disabled={loading}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
