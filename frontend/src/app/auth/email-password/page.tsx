// frontend/src/app/auth/email-password/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; // Import Firebase Auth functions
import Link from 'next/link';

// Initialize Firebase Auth (ensure this is done once, typically in a client-side config)
// This assumes you have a firebaseClient.ts or similar file initializing the app
import { app } from '../../../firebaseClient'; // Adjust path if your firebaseClient.ts is elsewhere
const auth = getAuth(app); // Get the auth instance

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get the Firebase ID token
      const idToken = await user.getIdToken();

      // Store the ID token in localStorage
      localStorage.setItem('firebaseIdToken', idToken);
      console.log('User logged in:', user.email);
      console.log('Firebase ID Token stored.');

      // IMPORTANT: Verify the user with your backend and fetch their role/profile
      // This is crucial to link the Firebase authenticated user to your database user
      try {
        const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
          method: 'POST', // Or GET if your /auth/login is designed to fetch profile without body
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`, // Send the Firebase ID token for backend verification
          },
          // No body needed for a simple profile fetch/login validation,
          // assuming your backend's @Post('login') just validates the token
          // and returns user data.
        });

        if (!backendResponse.ok) {
          const errorData = await backendResponse.json();
          throw new Error(errorData.message || 'Failed to verify user with backend.');
        }

        const backendUser = await backendResponse.json();
        console.log('Backend user data:', backendUser.user);

        // Store user role and other necessary data from backend response
        // This is important for conditional rendering/features on the frontend
        localStorage.setItem('userRole', backendUser.user.role);
        localStorage.setItem('userId', backendUser.user.id);

        // Redirect to dashboard or appropriate page after successful login and backend verification
        router.push('/dashboard'); // <-- This is the redirection
      } catch (backendError: any) {
        console.error('Backend verification error:', backendError);
        setError(`Login successful with Firebase, but backend verification failed: ${backendError.message}. Please try again.`);
        // Optionally, remove the token if backend verification is mandatory for app access
        localStorage.removeItem('firebaseIdToken');
      }

    } catch (err: any) {
      console.error('Login error:', err.code || err.message);
      let errorMessage = 'An unexpected error occurred during login.';
      if (err.code) {
        switch (err.code) {
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This user account has been disabled.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No user found with this email.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password.';
            break;
          case 'auth/invalid-credential': // For newer Firebase SDK versions
            errorMessage = 'Invalid email or password.';
            break;
          default:
            errorMessage = `Login failed: ${err.message}`;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Log in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 border border-red-200 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Logging In...' : 'Log in'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
