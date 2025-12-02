/**
 * Auth-Hook
 * 
 * Verwaltet den Auth-State und stellt User-Informationen + Auth-Methoden bereit
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  signUpWithEmailAndPassword,
  signOutUser 
} from '../firebase/auth';

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Hook für Auth-State und Auth-Aktionen
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auth-State-Listener
    const unsubscribe = onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup
    return () => unsubscribe();
  }, []);

  // Sign In
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }, []);

  // Sign Up
  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    try {
      await signUpWithEmailAndPassword(email, password, displayName);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }, []);

  // Sign Out
  const signOut = useCallback(async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
  };
}
