import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { type Session, type User, AuthError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Tables } from "../types/database.types";

type Profile = Tables<"profiles">;

export interface AuthContextValue {
  /** The current Supabase session, or `null` when signed out. */
  session: Session | null;
  /** The current Supabase auth user, or `null` when signed out. */
  user: User | null;
  /** The profile row from the `profiles` table, or `null` when signed out. */
  profile: Profile | null;
  /**
   * `true` while the initial session is being restored from storage.
   * Use this to avoid a flash of unauthenticated content on page load.
   */
  isLoading: boolean;
  /** Sign in with email + password. */
  login: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  /** Sign up with email + password. */
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  /** Sign out the current user. */
  logout: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) {
      console.error("Failed to fetch user profile:", error.message);
    }
    console.log(data)
    setProfile(data ?? null);
  }, []);

  useEffect(() => {
    // Restore existing session synchronously to avoid flash of unauthenticated content.
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) {
        fetchProfile(initialSession.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Subscribe to auth state changes (sign-in, sign-out, token refresh, etc.).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const login = useCallback(async (email: string, password: string) => {
    if (!email || !password) {
      const error = new AuthError("Email and password are required");
      return { error };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    console.log("Attempting to sign up with email:", email);
    if (!email || !password) {
      const error = new AuthError("Email and password are required");
      return { error };
    }

    const { error } = await supabase.auth.signUp({ email, password });

    return { error };
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  }, []);

  const value: AuthContextValue = useMemo(
    () => ({
      session,
      user,
      profile,
      isLoading,
      login,
      signUp,
      logout,
    }),
    [session, user, profile, isLoading, login, signUp, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
