"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

const DEV_USER_KEY = "ecoroute_dev_user";

function getDevUser(): User | null {
  if (process.env.NODE_ENV !== "development") return null;
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(DEV_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  devSignIn: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => ({}),
  signOut: async () => {},
  devSignIn: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const dev = getDevUser();
      if (dev) {
        setUser(dev);
        setIsLoading(false);
        return;
      }
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
      setIsLoading(false);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/map`,
      },
    });
    return { error: error?.message };
  };

  const devSignIn = () => {
    const devUser: User = {
      id: "dev-user-001",
      email: "dev@ecoroute.local",
      user_metadata: { full_name: "Dev Tester" },
      app_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
      role: "authenticated",
      updated_at: new Date().toISOString(),
    } as User;
    localStorage.setItem(DEV_USER_KEY, JSON.stringify(devUser));
    setUser(devUser);
  };

  const signOut = async () => {
    localStorage.removeItem(DEV_USER_KEY);
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, devSignIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
