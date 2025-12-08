import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Use localStorage for mock auth
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Only log non-404 errors, and don't log network errors in detail
        if (!error.message?.includes('Failed to fetch')) {
          console.error('Error loading profile:', error);
        }
        // If profile doesn't exist, try to get user info from auth
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          const userEmail = authData.user.email || '';
          const userName = authData.user.user_metadata?.name || userEmail.split('@')[0];
          
          // Create profile if it doesn't exist
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: userEmail,
              name: userName,
              role: 'user',
            });
          
          if (!insertError) {
            setUser({
              id: userId,
              email: userEmail,
              name: userName,
              role: 'user',
            });
          }
        }
        return;
      }

      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role as 'user' | 'admin',
        });
      }
    } catch (err) {
      // Silently handle network errors to avoid console spam
      if (err instanceof Error && !err.message?.includes('Failed to fetch')) {
        console.error('Error loading user profile:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // Mock login - check for admin email
      const isAdmin = email.toLowerCase().includes('admin') || email === 'admin@devsera.store';
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        role: isAdmin ? 'admin' : 'user',
      };
      console.log('Mock login:', mockUser); // Debug log
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Immediately load user profile after successful login
    if (data.user) {
      await loadUserProfile(data.user.id);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    if (!isSupabaseConfigured) {
      // Mock registration
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        name,
        role: 'user',
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'user',
        },
      },
    });

    if (error) throw error;

    // If user was created, manually create profile if trigger didn't work
    if (data.user) {
      try {
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();

        // If no profile exists, create one
        if (!existingProfile) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: email,
              name: name,
              role: 'user',
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
        }

        // Set user immediately for better UX
        setUser({
          id: data.user.id,
          email: email,
          name: name,
          role: 'user',
        });
      } catch (profileErr) {
        console.error('Profile creation error:', profileErr);
      }
    }
  };

  const logout = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      localStorage.removeItem('user');
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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
