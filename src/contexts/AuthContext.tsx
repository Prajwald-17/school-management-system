'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      console.log('Checking authentication status...');
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('User authenticated:', data.user);
        setUser(data.user);
      } else {
        console.log('User not authenticated:', data.message);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, otp: string): Promise<boolean> => {
    try {
      console.log('AuthContext: Attempting login...');
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('AuthContext: Login successful:', data.user);
        setUser(data.user);
        // Force a re-check of auth status to ensure consistency
        await checkAuth();
        return true;
      } else {
        console.log('AuthContext: Login failed:', data.message);
        setUser(null);
      }
      return false;
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      setUser(null);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Logging out...');
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      console.log('AuthContext: Logout successful');
    } catch (error) {
      console.error('AuthContext: Logout failed:', error);
      // Still clear user state even if request fails
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Debug logging for state changes
  useEffect(() => {
    console.log('AuthContext: User state changed:', user);
    console.log('AuthContext: Loading state:', loading);
  }, [user, loading]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
