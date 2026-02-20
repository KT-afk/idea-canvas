// Story 4.2 / 4.4: Theme Switcher Popover
// Shows 7 theme swatches with preview colors; keyboard-accessible radiogroup.
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette, Check } from "lucide-react";
import { type Theme, ALL_THEMES } from "@/hooks/useTheme";

// Metadata per theme for the swatch preview
const THEME_META: Record<
  Theme,
  { label: string; bg: string; primary: string; secondary: string; dark: boolean }
> = {
  'theme-purple-workshop': {
    label: 'Purple Workshop',
    bg: '#1C1625',
    primary: '#A855F7',
    secondary: '#4C3A5F',
    dark: true,
  },
  'theme-amethyst-night': {
    label: 'Amethyst Night',
    bg: '#0F0D1A',
    primary: '#9B72CF',
    secondary: '#2E2450',
    dark: true,
  },
  'theme-grape-noir': {
    label: 'Grape Noir',
    bg: '#110E18',
    primary: '#C084FC',
    secondary: '#3B2D52',
    dark: true,
  },
  'theme-warm-purple': {
    label: 'Warm Purple',
    bg: '#FBF9FE',
    primary: '#7C3AED',
    secondary: '#EDE9F8',
    dark: false,
  },
  'theme-dusty-violet': {
    label: 'Dusty Violet',
    bg: '#F8F5F2',
    primary: '#8B5CF6',
    secondary: '#EAE2F5',
    dark: false,
  },
  'theme-lavender-cream': {
    label: 'Lavender Cream',
    bg: '#FAFAFE',
    primary: '#A855F7',
    secondary: '#F5F0FF',
    dark: false,
  },
  'theme-warm': {
    label: 'Warm Vintage',
    bg: '#2A1F14',
    primary: '#D97706',
    secondary: '#3D2B1A',
    dark: true,
  },
};

interface ThemeSwitcherPopoverProps {
  currentTheme: Theme;
  onThemeChange: (theme: string) => void;
  isUpdating?: boolean;
}

export function ThemeSwitcherPopover({
  currentTheme,
  onThemeChange,
  isUpdating = false,
}: Readonly<ThemeSwitcherPopoverProps>) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors hover:bg-accent text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          aria-label="Change theme"
          aria-haspopup="dialog"
        >
          <Palette className={`w-4 h-4 ${isUpdating ? 'animate-pulse' : ''}`} />
          <span className="hidden sm:inline">Theme</span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-72 p-3" align="end">
        <div className="mb-3">
          <p className="text-sm font-semibold">Appearance</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Choose your workspace theme
          </p>
        </div>

        <div
          role="radiogroup"
          aria-label="Theme selection"
          className="grid grid-cols-1 gap-1.5"
        >
          {ALL_THEMES.map((theme) => {
            const meta = THEME_META[theme];
            const isSelected = theme === currentTheme;
            return (
              <button
                key={theme}
                role="radio"
                aria-checked={isSelected}
                onClick={() => {
                  if (!isSelected) onThemeChange(theme);
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                  isSelected
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-accent text-foreground'
                }`}
                aria-label={`${meta.label} theme${isSelected ? ' (active)' : ''}`}
              >
                {/* Color swatch preview */}
                <div
                  className="flex items-center gap-1 flex-shrink-0"
                  aria-hidden="true"
                >
                  {/* Background swatch */}
                  <div
                    className="w-6 h-6 rounded-sm border border-black/10 flex items-center justify-center"
                    style={{ backgroundColor: meta.bg }}
                  >
                    {/* Primary dot */}
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: meta.primary }}
                    />
                  </div>
                  {/* Secondary dot */}
                  <div
                    className="w-3 h-3 rounded-full border border-black/10"
                    style={{ backgroundColor: meta.secondary }}
                  />
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium leading-none">{meta.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {meta.dark ? 'Dark' : 'Light'}
                  </p>
                </div>

                {/* Selected checkmark */}
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
