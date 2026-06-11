import { useEffect, useState } from 'react';
import { User as SupabaseUser, AuthError, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface AuthUser extends SupabaseUser {
  role?: string;
}

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState((prev) => ({
        ...prev,
        session,
        user: session?.user as AuthUser || null,
        loading: false,
      }));
    });

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState((prev) => ({
        ...prev,
        session,
        user: session?.user as AuthUser || null,
        loading: false,
      }));
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, metadata?: { role?: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        setAuthState((prev) => ({ ...prev, error }));
        throw error;
      }

      return data;
    } catch (error) {
      const authError = error as AuthError;
      setAuthState((prev) => ({ ...prev, error: authError }));
      throw authError;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthState((prev) => ({ ...prev, error }));
        throw error;
      }

      return data;
    } catch (error) {
      const authError = error as AuthError;
      setAuthState((prev) => ({ ...prev, error: authError }));
      throw authError;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setAuthState((prev) => ({ ...prev, error }));
        throw error;
      }

      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      const authError = error as AuthError;
      setAuthState((prev) => ({ ...prev, error: authError }));
      throw authError;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        setAuthState((prev) => ({ ...prev, error }));
        throw error;
      }
    } catch (error) {
      const authError = error as AuthError;
      setAuthState((prev) => ({ ...prev, error: authError }));
      throw authError;
    }
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };
};
