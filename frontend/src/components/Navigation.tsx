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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
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
      setProfileMenuOpen(false);
      setMobileMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const isActive = (path: string) => pathname === path;

  if (loading) {
    return (
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="animate-pulse">
                <div className="h-8 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ServeMee
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/service-categories"
              className={`text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
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
                      className={`text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive('/service-requests') ? 'text-indigo-600 bg-indigo-50' : ''
                      }`}
                    >
                      My Requests
                    </Link>
                    <Link
                      href="/my-bookings"
                      className={`text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
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
                      className={`text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive('/my-services') ? 'text-indigo-600 bg-indigo-50' : ''
                      }`}
                    >
                      My Services
                    </Link>
                    <Link
                      href="/service-requests"
                      className={`text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive('/service-requests') ? 'text-indigo-600 bg-indigo-50' : ''
                      }`}
                    >
                      Service Requests
                    </Link>
                    <Link
                      href="/my-provider-bookings"
                      className={`text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive('/my-provider-bookings') ? 'text-indigo-600 bg-indigo-50' : ''
                      }`}
                    >
                      Provider Bookings
                    </Link>
                  </>
                )}

                {userRole === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    className={`text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive('/admin/dashboard') ? 'text-indigo-600 bg-indigo-50' : ''
                    }`}
                  >
                    Admin Dashboard
                  </Link>
                )}

                <div className="relative ml-4">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-gray-200 hover:border-indigo-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden lg:block">{user.displayName || user.email}</span>
                    <svg className="w-4 h-4 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.displayName || 'User'}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <p className="text-xs text-indigo-600 capitalize">{userRole?.replace('_', ' ')}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-200"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Dashboard</span>
                        </div>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Logout</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3 ml-4">
                <Link
                  href="/auth/email-password"
                  className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
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
              className="text-gray-700 hover:text-indigo-600 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50">
              <Link
                href="/service-categories"
                className={`text-gray-700 hover:text-indigo-600 hover:bg-white block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                  isActive('/service-categories') ? 'text-indigo-600 bg-white' : ''
                }`}
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
                        className={`text-gray-700 hover:text-indigo-600 hover:bg-white block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                          isActive('/service-requests') ? 'text-indigo-600 bg-white' : ''
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Requests
                      </Link>
                      <Link
                        href="/my-bookings"
                        className={`text-gray-700 hover:text-indigo-600 hover:bg-white block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                          isActive('/my-bookings') ? 'text-indigo-600 bg-white' : ''
                        }`}
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
                        className={`text-gray-700 hover:text-indigo-600 hover:bg-white block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                          isActive('/my-services') ? 'text-indigo-600 bg-white' : ''
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Services
                      </Link>
                      <Link
                        href="/service-requests"
                        className={`text-gray-700 hover:text-indigo-600 hover:bg-white block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                          isActive('/service-requests') ? 'text-indigo-600 bg-white' : ''
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Service Requests
                      </Link>
                      <Link
                        href="/my-provider-bookings"
                        className={`text-gray-700 hover:text-indigo-600 hover:bg-white block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                          isActive('/my-provider-bookings') ? 'text-indigo-600 bg-white' : ''
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Provider Bookings
                      </Link>
                    </>
                  )}

                  {userRole === 'admin' && (
                    <Link
                      href="/admin/dashboard"
                      className={`text-gray-700 hover:text-indigo-600 hover:bg-white block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                        isActive('/admin/dashboard') ? 'text-indigo-600 bg-white' : ''
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-gray-900">{user.displayName || 'User'}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs text-indigo-600 capitalize">{userRole?.replace('_', ' ')}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="text-gray-700 hover:text-indigo-600 hover:bg-white block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-red-600 hover:bg-red-50 block px-3 py-2 rounded-lg text-base font-medium w-full text-left transition-all duration-200"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/email-password"
                    className="text-gray-700 hover:text-indigo-600 hover:bg-white block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200"
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
