import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isDemoMode } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { name?: string; email?: string }) => Promise<{ error: any }>;
  isDemoMode: boolean;
  demoUsers: DemoUser[];
}

interface DemoUser {
  id: string;
  email: string;
  name: string;
  password: string;
  created_at: string;
  last_login: string;
}

// Demo users storage key
const DEMO_USERS_KEY = 'dashboard-demo-users';
const CURRENT_DEMO_USER_KEY = 'dashboard-current-demo-user';

// Mock user for demo mode
const createMockUser = (demoUser: DemoUser): User => ({
  id: demoUser.id,
  email: demoUser.email,
  user_metadata: { name: demoUser.name },
  created_at: demoUser.created_at,
  updated_at: new Date().toISOString(),
  aud: 'authenticated',
  app_metadata: {},
  phone: null,
  confirmed_at: demoUser.created_at,
  email_confirmed_at: demoUser.created_at,
  phone_confirmed_at: null,
  last_sign_in_at: demoUser.last_login,
  role: 'authenticated',
  factors: []
});

const createMockSession = (user: User): Session => ({
  access_token: `mock-access-token-${user.id}`,
  refresh_token: `mock-refresh-token-${user.id}`,
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user
});

// Demo users management
const getDemoUsers = (): DemoUser[] => {
  try {
    const stored = localStorage.getItem(DEMO_USERS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading demo users:', error);
  }
  
  // Return default demo user if none exist
  const defaultUser: DemoUser = {
    id: 'demo-user-1',
    email: 'demo@example.com',
    name: 'Demo User',
    password: 'demo123',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  };
  
  return [defaultUser];
};

const saveDemoUsers = (users: DemoUser[]) => {
  try {
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving demo users:', error);
  }
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): string | null => {
  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/(?=.*\d)/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  updateProfile: async () => ({ error: null }),
  isDemoMode: false,
  demoUsers: [],
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);

  useEffect(() => {
    if (isDemoMode) {
      // Load demo users
      const users = getDemoUsers();
      setDemoUsers(users);
      
      // Check for current session
      const currentUserId = localStorage.getItem(CURRENT_DEMO_USER_KEY);
      if (currentUserId) {
        const currentUser = users.find(u => u.id === currentUserId);
        if (currentUser) {
          const mockUser = createMockUser(currentUser);
          const mockSession = createMockSession(mockUser);
          setUser(mockUser);
          setSession(mockSession);
        }
      }
      setLoading(false);
    } else {
      // Real Supabase mode
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    if (isDemoMode) {
      // Demo mode authentication
      const users = getDemoUsers();
      const foundUser = users.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        // Update last login
        foundUser.last_login = new Date().toISOString();
        saveDemoUsers(users);
        
        const mockUser = createMockUser(foundUser);
        const mockSession = createMockSession(mockUser);
        setUser(mockUser);
        setSession(mockSession);
        localStorage.setItem(CURRENT_DEMO_USER_KEY, foundUser.id);
        return { error: null };
      } else {
        return { error: { message: 'Invalid email or password' } };
      }
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: { message: 'An unexpected error occurred during sign in' } };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    // Validation
    if (!name.trim()) {
      return { error: { message: 'Name is required' } };
    }
    
    if (!validateEmail(email)) {
      return { error: { message: 'Please enter a valid email address' } };
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return { error: { message: passwordError } };
    }

    if (isDemoMode) {
      // Demo mode signup
      const users = getDemoUsers();
      
      // Check if email already exists
      if (users.find(u => u.email === email)) {
        return { error: { message: 'An account with this email already exists' } };
      }
      
      // Create new demo user
      const newUser: DemoUser = {
        id: `demo-user-${Date.now()}`,
        email,
        name: name.trim(),
        password,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };
      
      const updatedUsers = [...users, newUser];
      saveDemoUsers(updatedUsers);
      setDemoUsers(updatedUsers);
      
      return { error: null };
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ff9daf5a/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Signup error response:', errorText);
        return { error: { message: errorText || 'Failed to create account' } };
      }

      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { error: { message: 'An unexpected error occurred during signup' } };
    }
  };

  const updateProfile = async (updates: { name?: string; email?: string }) => {
    if (isDemoMode) {
      if (!user) return { error: { message: 'No user logged in' } };
      
      const users = getDemoUsers();
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex === -1) {
        return { error: { message: 'User not found' } };
      }
      
      // Validate updates
      if (updates.email && !validateEmail(updates.email)) {
        return { error: { message: 'Please enter a valid email address' } };
      }
      
      if (updates.email && users.find(u => u.email === updates.email && u.id !== user.id)) {
        return { error: { message: 'Email is already taken' } };
      }
      
      // Update user
      if (updates.name) users[userIndex].name = updates.name.trim();
      if (updates.email) users[userIndex].email = updates.email;
      
      saveDemoUsers(users);
      setDemoUsers(users);
      
      // Update current user state
      const updatedUser = createMockUser(users[userIndex]);
      setUser(updatedUser);
      setSession(createMockSession(updatedUser));
      
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        data: updates
      });
      return { error };
    } catch (error) {
      console.error('Profile update error:', error);
      return { error: { message: 'An unexpected error occurred' } };
    }
  };

  const signOut = async () => {
    if (isDemoMode) {
      setUser(null);
      setSession(null);
      localStorage.removeItem(CURRENT_DEMO_USER_KEY);
      return;
    }

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isDemoMode,
    demoUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};