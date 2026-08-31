"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("talentgrid_theme") || "light";
    setThemeState(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
    if (savedTheme === "light") {
      document.documentElement.classList.add("light-theme");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.remove("light-theme");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem("talentgrid_theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    if (newTheme === "light") {
      document.documentElement.classList.add("light-theme");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.remove("light-theme");
      document.documentElement.classList.add("dark");
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "midnight" : theme === "midnight" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
