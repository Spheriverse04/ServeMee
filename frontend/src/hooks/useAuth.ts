'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: string | null;
  isLoading: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/profile`, {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });

          if (response.ok) {
            const backendUser = await response.json();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: backendUser.user.displayName || firebaseUser.displayName,
              role: backendUser.user.role,
              isLoading: false,
            });
            localStorage.setItem('userRole', backendUser.user.role);
            localStorage.setItem('userId', backendUser.user.id);
            localStorage.setItem('firebaseIdToken', idToken);
          } else {
            throw new Error('Failed to fetch user profile');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            role: localStorage.getItem('userRole'),
            isLoading: false,
          });
        }
      } else {
        setUser(null);
        localStorage.removeItem('firebaseIdToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}