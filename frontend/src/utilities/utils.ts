// Color mapping for note backgrounds with varied intensities
export const getColorClass = (color: string): string => {
  const colorMap: Record<string, string> = {
    yellow: "#fef08a",      // yellow-200 (light)
    red: "#f87171",         // red-400 (medium)
    blue: "#93c5fd",        // blue-300 (medium)
    green: "#86efac",       // green-300 (medium)
    purple: "#c084fc",      // purple-400 (medium)
    orange: "#fb923c",      // orange-400 (medium)
    pink: "#f9a8d4",        // pink-300 (medium)
    teal: "#5eead4",        // teal-300 (medium)
    indigo: "#a5b4fc",      // indigo-300 (medium)
    lime: "#bef264",        // lime-300 (medium)
    rose: "#fb7185",        // rose-400 (medium)
    cyan: "#67e8f9",        // cyan-300 (medium)
    amber: "#fbbf24",       // amber-400 (medium)
    emerald: "#6ee7b7",     // emerald-300 (medium)
    violet: "#a78bfa",      // violet-400 (medium)
    fuchsia: "#e879f9",     // fuchsia-400 (medium)
    classicRed: "#ff0000",  // pure red
    classicBlue: "#0000ff", // pure blue
    classicGreen: "#00ff00",// pure green
    white: "#ffffff",       // white
    black: "#1a1a1a",       // dark gray (better than pure black)
    gray: "#9ca3af",        // gray-400
  };
  return colorMap[color] || "#fef08a"; // default to yellow
};