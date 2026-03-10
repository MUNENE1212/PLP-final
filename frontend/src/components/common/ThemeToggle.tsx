import React from 'react';
import { Moon } from 'lucide-react';

/**
 * ThemeToggle Component
 *
 * Since this is a dark-only design system with the Rich Dark Theme,
 * this component is now a visual indicator of the dark theme mode.
 * It no longer toggles between light and dark modes.
 *
 * The design system uses:
 * - Deep Mahogany (#261212) as primary background
 * - Iron Charcoal (#1C1C1C) as secondary background
 * - Circuit Blue (#0090C5) as primary accent
 * - Wrench Purple (#7D4E9F) as secondary accent
 */
const ThemeToggle: React.FC = () => {
  return (
    <button
      className="p-2 rounded-lg bg-charcoal border border-subtle hover:bg-hover transition-colors duration-200"
      aria-label="Dark theme enabled"
      title="Dark theme (always on)"
    >
      <Moon className="w-5 h-5 text-circuit" />
    </button>
  );
};

export default ThemeToggle;
