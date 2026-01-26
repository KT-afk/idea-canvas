// Color mapping for note backgrounds with varied intensities - Vintage/Warm Palette
export const getColorClass = (color: string): string => {
  const colorMap: Record<string, string> = {
    // Warm/Vintage Palette
    yellow: "#FEF3C7",      // warm yellow
    red: "#FCA5A5",         // soft red
    blue: "#93C5FD",        // soft blue
    green: "#86EFAC",       // soft green
    purple: "#D8B4FE",      // soft purple
    orange: "#FDBA74",      // warm orange
    pink: "#F9A8D4",        // soft pink
    teal: "#5EEAD4",        // soft teal
    indigo: "#A5B4FC",      // soft indigo
    lime: "#BEF264",        // soft lime
    rose: "#FDA4AF",        // soft rose
    cyan: "#67E8F9",        // soft cyan
    amber: "#FCD34D",       // warm amber
    emerald: "#6EE7B7",     // soft emerald
    violet: "#C4B5FD",      // soft violet
    fuchsia: "#F0ABFC",     // soft fuchsia
    
    // Classics / Neutrals
    classicRed: "#EF4444",  // vibrant red
    classicBlue: "#3B82F6", // vibrant blue
    classicGreen: "#22C55E",// vibrant green
    white: "#FFFFFF",       // white
    black: "#1F2937",       // dark charcoal
    gray: "#9CA3AF",        // cool gray
  };
  return colorMap[color] || "#FEF3C7"; // default to warm yellow
};