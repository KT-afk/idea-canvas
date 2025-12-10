import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { getColorClass } from "@/utilities/utils";

interface PopoverDemoProps{
    onColorChange: (color: string) => void;
}
export function PopoverDemo({onColorChange}:Readonly<PopoverDemoProps>){
    const colorsList = ["yellow", "red", "blue", "green", "purple", "orange", "pink", "teal", "indigo", "lime", "rose", "cyan", "amber", "emerald", "violet", "fuchsia", "classicRed", "classicBlue", "classicGreen", "white", "black", "gray"]
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="top-2 left-2">🎨</button>
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
