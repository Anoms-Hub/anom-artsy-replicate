/**
 * useTheme — reads the user's saved backgroundId from their profile and
 * applies the matching CSS theme class to <html> so the entire app reflects
 * their chosen theme. Call this once in App.tsx.
 */
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

const THEME_CLASSES = ["theme-dark", "theme-light", "theme-neon-blue", "theme-neon-purple"];

const BACKGROUND_ID_TO_CLASS: Record<string, string> = {
  dark: "theme-dark",
  light: "theme-light",
  "neon-blue": "theme-neon-blue",
  "neon-purple": "theme-neon-purple",
};

export function useTheme() {
  const { isAuthenticated } = useAuth();
  const profileQuery = trpc.profiles.getMyFullProfile.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 min — don't re-fetch on every render
  });

  const backgroundId = profileQuery.data?.profile?.backgroundId ?? "dark";

  useEffect(() => {
    const themeClass = BACKGROUND_ID_TO_CLASS[backgroundId] ?? "theme-dark";
    const html = document.documentElement;
    // Remove all existing theme classes
    THEME_CLASSES.forEach((cls) => html.classList.remove(cls));
    // Apply the selected theme
    html.classList.add(themeClass);
  }, [backgroundId]);
}
