"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // This code will only run on the client side
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const initialTheme = savedTheme || "light"; // Default to light theme

    setTheme(initialTheme);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (isInitialized) {
      localStorage.setItem("theme", theme);
      // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme, isInitialized]);

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
export const useTheme = () => {
  const context = useContext(ThemeContext);
  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
