// frontend/src/components/Navigation.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export default function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        });
        const role = localStorage.getItem('userRole');
        setUserRole(role);
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('firebaseIdToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const isActive = (path: string) => pathname === path;

  if (loading) {
    return (
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-indigo-600">ServeMee</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              ServeMee
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/service-categories"
              className={`text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/service-categories') ? 'text-indigo-600 bg-indigo-50' : ''
              }`}
            >
              Browse Services
            </Link>

            {user ? (
              <>
                {userRole === 'consumer' && (
                  <>
                    <Link
                      href="/service-requests"
                      className={`text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium ${
                        isActive('/service-requests') ? 'text-indigo-600 bg-indigo-50' : ''
                      }`}
                    >
                      My Requests
                    </Link>
                    <Link
                      href="/my-bookings"
                      className={`text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium ${
                        isActive('/my-bookings') ? 'text-indigo-600 bg-indigo-50' : ''
                      }`}
                    >
                      My Bookings
                    </Link>
                  </>
                )}

                {userRole === 'service_provider' && (
                  <>
                    <Link
                      href="/my-services"
                      className={`text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium ${
                        isActive('/my-services') ? 'text-indigo-600 bg-indigo-50' : ''
                      }`}
                    >
                      My Services
                    </Link>
                    <Link
                      href="/service-requests"
                      className={`text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium ${
                        isActive('/service-requests') ? 'text-indigo-600 bg-indigo-50' : ''
                      }`}
                    >
                      Service Requests
                    </Link>
                    <Link
                      href="/my-provider-bookings"
                      className={`text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium ${
                        isActive('/my-provider-bookings') ? 'text-indigo-600 bg-indigo-50' : ''
                      }`}
                    >
                      My Bookings
                    </Link>
                  </>
                )}

                {userRole === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    className={`text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/admin/dashboard') ? 'text-indigo-600 bg-indigo-50' : ''
                    }`}
                  >
                    Admin Dashboard
                  </Link>
                )}

                <div className="relative">
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="flex items-center text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {user.displayName || user.email}
                    <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {mobileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/email-password"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-indigo-600 p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/service-categories"
                className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Services
              </Link>

              {user ? (
                <>
                  {userRole === 'consumer' && (
                    <>
                      <Link
                        href="/service-requests"
                        className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Requests
                      </Link>
                      <Link
                        href="/my-bookings"
                        className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Bookings
                      </Link>
                    </>
                  )}

                  {userRole === 'service_provider' && (
                    <>
                      <Link
                        href="/my-services"
                        className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Services
                      </Link>
                      <Link
                        href="/service-requests"
                        className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Service Requests
                      </Link>
                    </>
                  )}

                  <Link
                    href="/dashboard"
                    className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/email-password"
                    className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
