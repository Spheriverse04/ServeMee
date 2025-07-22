// frontend/src/app/auth/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import Link from 'next/link';
import { app } from '../../../firebaseClient'; // Adjust path if your firebaseClient.ts is elsewhere
const auth = getAuth(app);

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const roleFromUrl = searchParams.get('role') as 'consumer' | 'service_provider' | null;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  // Corrected: Initialize with lowercase 'consumer' and define type with lowercase strings
  const [role, setRole] = useState<'consumer' | 'service_provider'>(roleFromUrl || 'consumer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user; // Get the user object (contains user.uid)

      // 2. Get Firebase ID token
      const idToken = await user.getIdToken();

      // 3. Send user details (including Firebase UID, NOT password) to your NestJS backend
      const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`, // Pass Firebase ID token for authentication
        },
        body: JSON.stringify({
          email,
          // IMPORTANT: Removed 'password' from the body sent to backend
          displayName,
          role, // This will now send 'consumer' or 'service_provider' (lowercase)
          firebaseUid: user.uid, // IMPORTANT: Add the Firebase User UID here!
        }),
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        throw new Error(errorData.message || 'Failed to register with backend.');
      }

      const backendUser = await backendResponse.json();
      console.log('User registered in backend:', backendUser);
      setSuccess('Registration successful! Redirecting to login...');

      setTimeout(() => {
        router.push('/auth/email-password'); // Redirect to the login page
      }, 2000);

    } catch (err: any) {
      console.error('Registration error:', err.code || err.message);
      let errorMessage = 'An unexpected error occurred during registration.';
      if (err.code) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'The email address is already in use by another account.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'The email address is not valid.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Email/password accounts are not enabled. Enable it in Firebase Console.';
            break;
          case 'auth/weak-password':
            errorMessage = 'The password is too weak.';
            break;
          default:
            errorMessage = `Registration failed: ${err.message}`;
        }
      } else {
         // If error is from backend validation, it might be in err.message
        errorMessage = `Registration error: ${err.message}`;
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
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join ServeMee and start {role === 'service_provider' ? 'providing services' : 'finding services'} today
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
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
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="display-name" className="sr-only">
                Display Name
              </label>
              <input
                id="display-name"
                name="displayName"
                type="text"
                autoComplete="name"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                placeholder="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="role" className="sr-only">
                Role
              </label>
              <select
                id="role"
                name="role"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                value={role}
                // Corrected: Cast to lowercase string type
                onChange={(e) => setRole(e.target.value as 'consumer' | 'service_provider')}
                disabled={loading}
              >
                {/* Corrected: Option values must be lowercase strings to match backend enum */}
                <option value="consumer">I need services (Consumer)</option>
                <option value="service_provider">I provide services (Service Provider)</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/email-password" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
