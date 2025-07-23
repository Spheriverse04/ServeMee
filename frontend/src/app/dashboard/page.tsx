'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Link from 'next/link';

interface UserInfo {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  role: string | null;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/profile`, {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });

          if (!response.ok) throw new Error('Failed to fetch user profile from backend');

          const backendUser = await response.json();

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: backendUser.user.displayName,
            phoneNumber: backendUser.user.phoneNumber || null,
            role: backendUser.user.role,
          });

          localStorage.setItem('userRole', backendUser.user.role);
          localStorage.setItem('userId', backendUser.user.id);

        } catch (error) {
          console.error('Error fetching backend user info:', error);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || null,
            phoneNumber: null,
            role: localStorage.getItem('userRole') || null,
          });
        }
      } else {
        setUser(null);
        localStorage.removeItem('firebaseIdToken');
        localStorage.removeItem('currentUserUid');
        router.push('/auth/email-password');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      console.log('Firebase logout successful!');
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user.displayName || user.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600">Here's what's happening with your ServeMee account</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600 mb-2">Active</p>
            <p className="text-gray-600 text-sm">Your account is verified and ready to use</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Role</h3>
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-indigo-600 mb-2 capitalize">
              {user.role?.replace('_', ' ') || 'User'}
            </p>
            <p className="text-gray-600 text-sm">Your current account type</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <Link
                href="/services"
                className="block text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Find Available Services →
              </Link>
              {user.role === 'service_provider' && (
                <Link
                  href="/my-services"
                  className="block text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  Manage Services →
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
              <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{user.displayName || 'Not set'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{user.phoneNumber || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
              <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg font-mono text-sm">{user.uid}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
              <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg capitalize">
                {user.role?.replace('_', ' ') || 'User'}
              </p>
            </div>
          </div>

          <div className="mt-6 text-right">
            <Link
              href="/profile"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

