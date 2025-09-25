"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "@/hooks/useSupabase";

interface AuthUser {
  id: string;
  email?: string;
}

interface Profile {
  id: string;
  full_name?: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState & {
  signOut: () => Promise<void>;
} {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useSupabase();

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Profile error:", error);
      } else if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Profile load error:", error);
    }
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        setIsLoading(true);

        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (authError) {
          console.error("Auth error:", authError);
          setUser(null);
          setProfile(null);
          setIsLoading(false);
          return;
        }

        if (authUser) {
          setUser({ id: authUser.id, email: authUser.email });

          // Crear perfil básico
          const basicProfile = {
            id: authUser.id,
            email: authUser.email || "",
            full_name:
              authUser.user_metadata?.name ||
              authUser.user_metadata?.full_name ||
              authUser.email?.split("@")[0] ||
              "Usuario",
          };
          setProfile(basicProfile);

          // Intentar cargar perfil de la base de datos
          await loadProfile(authUser.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setUser(null);
        setProfile(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Timeout de seguridad para evitar loading infinito
    const safetyTimeout = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, 5000); // 5 segundos

    const initTimeout = setTimeout(() => {
      initAuth();
    }, 100);

    // Auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        setUser({ id: session.user.id, email: session.user.email });

        const basicProfile = {
          id: session.user.id,
          email: session.user.email || "",
          full_name:
            session.user.user_metadata?.name ||
            session.user.user_metadata?.full_name ||
            session.user.email?.split("@")[0] ||
            "Usuario",
        };
        setProfile(basicProfile);

        await loadProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(initTimeout);
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, [supabase, loadProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    signOut,
  };
}
