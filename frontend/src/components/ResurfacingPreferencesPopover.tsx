// Story 7.4: Resurfacing Frequency Preferences UI
// Accessible popover with 4 frequency options: Normal, Frequent, Rare, Off
// Optimistic UI — changes apply immediately; syncs to server in background
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, BellOff, Check, RotateCcw } from "lucide-react";
import type { ResurfaceFrequency } from "@/hooks/usePreferences";

const FREQUENCY_OPTIONS: {
  value: ResurfaceFrequency;
  label: string;
  description: string;
}[] = [
  {
    value: 'frequent',
    label: 'Frequent',
    description: 'Up to 2 ideas per day',
  },
  {
    value: 'normal',
    label: 'Normal',
    description: '1 idea per app open (default)',
  },
  {
    value: 'rare',
    label: 'Rare',
    description: '1 idea per week maximum',
  },
  {
    value: 'off',
    label: 'Off',
    description: 'Disable resurfacing completely',
  },
];

const DEFAULT_FREQUENCY: ResurfaceFrequency = 'normal';

interface ResurfacingPreferencesPopoverProps {
  /** Current value from USER_PREFERENCES.resurfaceFrequency */
  currentFrequency: string | undefined;
  /** Mutation handler from usePreferences */
  onFrequencyChange: (frequency: ResurfaceFrequency) => void;
  /** True while the mutation is in-flight */
  isUpdating?: boolean;
}

export function ResurfacingPreferencesPopover({
  currentFrequency,
  onFrequencyChange,
  isUpdating = false,
}: Readonly<ResurfacingPreferencesPopoverProps>) {
  const frequency = (currentFrequency ?? DEFAULT_FREQUENCY) as ResurfaceFrequency;
  const isOff = frequency === 'off';

  const handleSelect = (value: ResurfaceFrequency) => {
    if (value !== frequency) {
      onFrequencyChange(value);
    }
  };

  const handleReset = () => {
    if (frequency !== DEFAULT_FREQUENCY) {
      onFrequencyChange(DEFAULT_FREQUENCY);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
            isOff
              ? 'text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted'
              : 'text-foreground hover:bg-accent'
          }`}
          aria-label={`Resurfacing: ${frequency}. Click to change frequency.`}
          aria-haspopup="dialog"
        >
          {isOff ? (
            <BellOff className="w-4 h-4" />
          ) : (
            <Bell className={`w-4 h-4 ${isUpdating ? 'animate-pulse' : ''}`} />
          )}
          <span className="hidden sm:inline capitalize">{frequency}</span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-72 p-3" align="end">
        <div className="mb-2">
          <p className="text-sm font-semibold">Idea Resurfacing</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            How often should forgotten ideas resurface?
          </p>
        </div>

        <div
          role="radiogroup"
          aria-label="Resurfacing frequency"
          className="flex flex-col gap-1"
        >
          {FREQUENCY_OPTIONS.map(({ value, label, description }) => {
            const isSelected = value === frequency;
            return (
              <button
                key={value}
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelect(value)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                  isSelected
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-accent text-foreground'
                }`}
                aria-label={`${label}: ${description}`}
              >
                {/* Selected checkmark */}
                <div className={`w-4 h-4 flex-shrink-0 flex items-center justify-center rounded-full border ${
                  isSelected ? 'border-primary bg-primary' : 'border-border'
                }`}>
                  {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium leading-none">{label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Reset to default */}
        {frequency !== DEFAULT_FREQUENCY && (
          <div className="mt-2 pt-2 border-t border-border">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded px-1 py-0.5 w-full"
              aria-label="Reset resurfacing frequency to Normal (default)"
            >
              <RotateCcw className="w-3 h-3" />
              Reset to default (Normal)
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
