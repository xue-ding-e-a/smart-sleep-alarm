import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'day' | 'night';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'smart_alarm_theme';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('day');

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'night') {
        document.body.classList.add('night-theme');
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'day' ? 'night' : 'day';
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    if (newTheme === 'night') {
      document.body.classList.add('night-theme');
    } else {
      document.body.classList.remove('night-theme');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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
