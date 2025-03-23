
import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = localStorage.getItem("theme") === "dark" || 
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    
    setIsDark(isDarkMode);
    
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="relative w-9 h-9 rounded-full transition-all duration-300 hover:bg-secondary"
    >
      <Sun 
        className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
          isDark ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
        }`} 
      />
      <Moon 
        className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
          isDark ? "opacity-100 rotate-0" : "opacity-0 rotate-90"
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;
