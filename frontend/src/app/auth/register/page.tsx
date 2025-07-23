'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import Link from 'next/link';
import { app } from '@/firebaseClient';

const auth = getAuth(app);

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const roleFromUrl = searchParams.get('role') as 'consumer' | 'service_provider' | null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName });
      }

      const idToken = await user.getIdToken();

      const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          email,
          displayName,
          role,
          phoneNumber,
          firebaseUid: user.uid,
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
        router.push('/auth/email-password');
      }, 2000);
    } catch (err: any) {
      console.error('Registration error:', err.code || err.message);
      let errorMessage = 'An unexpected error occurred during registration.';
      if (err.code) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Email address is already in use.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak.';
            break;
          default:
            errorMessage = `Registration failed: ${err.message}`;
        }
      } else {
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
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <input
              id="display-name"
              name="displayName"
              type="text"
              autoComplete="name"
              required
              className="block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={loading}
            />
            <input
              id="phone-number"
              name="phoneNumber"
              type="tel"
              pattern="[0-9]{10}"
              required
              title="Phone number must be 10 digits"
              className="block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={loading}
            />
            <select
              id="role"
              name="role"
              required
              className="block w-full px-4 py-3 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value as 'consumer' | 'service_provider')}
              disabled={loading}
            >
              <option value="consumer">I need services (Consumer)</option>
              <option value="service_provider">I provide services (Service Provider)</option>
            </select>
          </div>

          {error && <div className="p-4 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
          {success && <div className="p-4 bg-green-100 text-green-700 rounded-md text-sm">{success}</div>}

          <button
            type="submit"
            className="w-full py-3 px-4 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium text-sm disabled:opacity-50"
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

