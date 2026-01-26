import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { getColorClass } from "@/utilities/utils";
import { Check, ClipboardList, Lightbulb, StickyNote } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

interface PopoverDemoProps{
    icon: LucideIcon;
    selectedColor: string; // Story 1.7: Indicate selected color
    onColorChange: (color: string) => void;
}
export function ColorPickerPopover({icon: Icon, selectedColor, onColorChange}:Readonly<PopoverDemoProps>){
    const colorsList = ["yellow", "red", "blue", "green", "purple", "orange", "pink", "teal", "indigo", "lime", "rose", "cyan", "amber", "emerald", "violet", "fuchsia", "classicRed", "classicBlue", "classicGreen", "white", "black", "gray"]
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="top-2 left-2 hover:opacity-70 transition-opacity p-1">
          <Icon className="w-5 h-5" />
          {/* Visual indicator that this is the color picker for the current color */}
          <span className="sr-only">Change color, current is {selectedColor}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto h-auto p-2">
        <div className="flex gap-2 flex-wrap max-w-[200px]">
            {colorsList.map((color: string) => {
                const isSelected = color === selectedColor;
                // Determine checkmark color based on background brightness
                const checkColor = ['white', 'yellow', 'lime', 'cyan', 'teal'].includes(color) ? 'black' : 'white';
                
                return (
                    <button 
                        key={color} 
                        style={{backgroundColor: getColorClass(color)}} 
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary focus-visible:outline-none ${isSelected ? 'ring-2 ring-offset-1 ring-primary' : ''}`} 
                        onClick={() => onColorChange(color)}
                        aria-label={`Select ${color}`}
                        aria-selected={isSelected}
                    >
                        {isSelected && <Check className="w-4 h-4" style={{ color: checkColor }} />}
                    </button>
                )
            })
            }
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface TypePickerPopoverProps {
  icon: LucideIcon;
  onTypeSelect: (type: 'note' | 'idea' | 'plan') => void;
}

export function TypePickerPopover({ icon: Icon, onTypeSelect }: Readonly<TypePickerPopoverProps>) {
  const [open, setOpen] = useState(false);

  const handleTypeSelect = (type: 'note' | 'idea' | 'plan') => {
    onTypeSelect(type);
    setOpen(false); // Close popover after selection
  };

  const typeOptions = [
    { type: 'note' as const, icon: StickyNote, label: 'Note', description: 'Reference & capture' },
    { type: 'idea' as const, icon: Lightbulb, label: 'Idea', description: 'Brainstorm & explore' },
    { type: 'plan' as const, icon: ClipboardList, label: 'Plan', description: 'Organize & execute' },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="bg-[#A855F7] hover:bg-[#9333EA] text-white px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors"
          aria-label="Add new note, idea, or plan"
        >
          <Icon className="w-5 h-5" />
          <span className="text-xs font-medium">New</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="flex flex-col gap-1">
          {typeOptions.map(({ type, icon: TypeIcon, label, description }) => (
            <button
              key={type}
              onClick={() => handleTypeSelect(type)}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors text-left group"
              aria-label={`Create ${label}`}
            >
              <TypeIcon className="w-5 h-5 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="flex flex-col">
                <span className="font-medium text-sm">{label}</span>
                <span className="text-xs opacity-60">{description}</span>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
