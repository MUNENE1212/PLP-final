import React, { createContext, useContext, ReactNode } from 'react';

type Theme = 'dark'; // Dark-only theme now

interface ThemeContextType {
  theme: Theme;
  isDarkOnly: boolean; // Indicates this is a dark-only design system
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider for Rich Dark Design System
 *
 * This design system is dark-only, featuring:
 * - Deep Mahogany (#261212) primary background
 * - Iron Charcoal (#1C1C1C) secondary background
 * - Circuit Blue (#0090C5) primary accent
 * - Wrench Purple (#7D4E9F) secondary accent
 * - Soft Bone (#E0E0E0) primary text
 * - Steel Grey (#9BA4B0) secondary text and borders
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Always use dark theme
  const theme: Theme = 'dark';
  const isDarkOnly = true;

  // Set dark class on document root
  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
    // Set color scheme to dark
    root.style.colorScheme = 'dark';
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isDarkOnly }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
