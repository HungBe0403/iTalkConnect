import { createContext, useState, useEffect, ReactNode } from 'react';

type ThemeType = 'light' | 'dark';
type ChatBackgroundType = 'default' | 'bubbles' | 'geometric' | 'gradient';

interface ThemeContextType {
  theme: ThemeType;
  chatBackground: ChatBackgroundType;
  accentColor: string;
  toggleTheme: () => void;
  setChatBackground: (bg: ChatBackgroundType) => void;
  setAccentColor: (color: string) => void;
}

const THEME_KEY = 'chat-app-theme';
const BG_KEY = 'chat-app-bg';
const COLOR_KEY = 'chat-app-accent';

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  chatBackground: 'default',
  accentColor: 'primary-500',
  toggleTheme: () => {},
  setChatBackground: () => {},
  setAccentColor: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    return (savedTheme as ThemeType) || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });
  
  const [chatBackground, setChatBg] = useState<ChatBackgroundType>(() => {
    const savedBg = localStorage.getItem(BG_KEY);
    return (savedBg as ChatBackgroundType) || 'default';
  });
  
  const [accentColor, setAccent] = useState<string>(() => {
    const savedColor = localStorage.getItem(COLOR_KEY);
    return savedColor || 'primary-500';
  });

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(BG_KEY, chatBackground);
  }, [chatBackground]);

  useEffect(() => {
    localStorage.setItem(COLOR_KEY, accentColor);
  }, [accentColor]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const setChatBackground = (bg: ChatBackgroundType) => {
    setChatBg(bg);
  };

  const setAccentColor = (color: string) => {
    setAccent(color);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        chatBackground,
        accentColor,
        toggleTheme,
        setChatBackground,
        setAccentColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};