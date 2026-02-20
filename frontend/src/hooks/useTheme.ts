// Story 4.2 / 4.4: Theme management hook
// Reads preferences?.theme, applies CSS class to <html>, detects system preference on first load.
import { useEffect } from 'react';
import { usePreferences } from './usePreferences';

export const ALL_THEMES = [
  'theme-purple-workshop',
  'theme-amethyst-night',
  'theme-grape-noir',
  'theme-warm-purple',
  'theme-dusty-violet',
  'theme-lavender-cream',
  'theme-warm',
] as const;

export type Theme = (typeof ALL_THEMES)[number];

// Map system color-scheme preference to a sensible default
const SYSTEM_DARK_DEFAULT: Theme = 'theme-purple-workshop';
const SYSTEM_LIGHT_DEFAULT: Theme = 'theme-warm-purple';

function getSystemDefault(): Theme {
  if (typeof window === 'undefined') return SYSTEM_DARK_DEFAULT;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? SYSTEM_DARK_DEFAULT
    : SYSTEM_LIGHT_DEFAULT;
}

function isValidTheme(value: string | undefined): value is Theme {
  return ALL_THEMES.includes(value as Theme);
}

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  // Remove all existing theme classes
  ALL_THEMES.forEach((t) => html.classList.remove(t));
  // Apply the new one (theme-purple-workshop is also :root default but explicit class is fine)
  html.classList.add(theme);
}

interface UseThemeResult {
  currentTheme: Theme;
  setTheme: (theme: string) => void;
  isUpdatingTheme: boolean;
}

export function useTheme(): UseThemeResult {
  const { preferences, setTheme, isUpdatingTheme } = usePreferences();

  // Resolve active theme: server preference → system default
  const savedTheme = preferences?.theme;
  const currentTheme: Theme = isValidTheme(savedTheme)
    ? savedTheme
    : getSystemDefault();

  // Apply CSS class to <html> whenever theme changes
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  return { currentTheme, setTheme, isUpdatingTheme };
}
