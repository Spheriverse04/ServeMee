'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/profile`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });

          if (!res.ok) throw new Error('Failed to fetch user profile');

          const data = await res.json();
          setDisplayName(data.user.displayName || '');
          setEmail(data.user.email);
          setPhoneNumber(data.user.phoneNumber || '');
        } catch (err) {
          console.error(err);
        }
      } else {
        router.push('/auth/email-password');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateProfile(user, { displayName });

      const idToken = await user.getIdToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/update-profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ displayName, phoneNumber }),
      });

      if (!response.ok) throw new Error('Failed to update backend profile');

      setSuccessMessage('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      setErrorMessage('Error updating profile.');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Update Profile</h2>
        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 bg-gray-100 cursor-not-allowed"
              value={email}
              disabled
            />
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              pattern="[0-9]{10}"
              maxLength={10}
              title="Enter a valid 10-digit phone number"
              required
            />
          </div>

          {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}
          {errorMessage && <p className="text-red-600 text-sm">{errorMessage}</p>}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
}

