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

        // Redirect based on user role
switch (backendUser.user.role) {
  case 'admin':
    router.push('/admin/dashboard');
    break;
  case 'service_provider':
    router.push('/dashboard'); // or /provider/dashboard if separate
    break;
  case 'consumer':
    router.push('/dashboard'); // or /consumer/dashboard if separate
    break;
  default:
    router.push('/dashboard');
}
// <-- This is the redirection
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your ServeMee account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
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
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
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
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

