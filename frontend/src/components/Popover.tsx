import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { getColorClass } from "@/utilities/utils";
import type { LucideIcon } from "lucide-react";

interface PopoverDemoProps{
    icon: LucideIcon;
    onColorChange: (color: string) => void;
}
export function ColorPickerPopover({icon: Icon, onColorChange}:Readonly<PopoverDemoProps>){
    const colorsList = ["yellow", "red", "blue", "green", "purple", "orange", "pink", "teal", "indigo", "lime", "rose", "cyan", "amber", "emerald", "violet", "fuchsia", "classicRed", "classicBlue", "classicGreen", "white", "black", "gray"]
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="top-2 left-2 hover:opacity-70 transition-opacity p-1">
          <Icon className="w-5 h-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto h-auto p-2">
        <div className="flex gap-2 flex-wrap max-w-[200px]">
            {colorsList.map((color: string) => {
                return (
                    <button key={color} style={{backgroundColor: getColorClass(color)}} className="w-8 h-8 rounded-full items-center" onClick={() => onColorChange(color)}/>
                )
            })
            }
        </div>
      </PopoverContent>
    </Popover>
  )
}
