"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

function getNextTheme(current: ThemeMode): ThemeMode {
  return current === "light" ? "dark" : "light";
}

export function ThemeToggle({ initialTheme }: { initialTheme: ThemeMode }) {
  const [theme, setTheme] = useState<ThemeMode>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function handleToggle() {
    const nextTheme = getNextTheme(theme);
    document.documentElement.dataset.theme = nextTheme;
    document.cookie = `selaras-theme=${nextTheme}; path=/; max-age=31536000; samesite=lax`;
    localStorage.setItem("selaras-theme", nextTheme);
    setTheme(nextTheme);
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={handleToggle}
      aria-label={isDark ? "Gunakan tema terang" : "Gunakan tema gelap"}
      title={isDark ? "Gunakan tema terang" : "Gunakan tema gelap"}
    >
      <span className="theme-toggle-icon">
        {isDark ? <SunMedium size={16} /> : <MoonStar size={16} />}
      </span>
      <span className="theme-toggle-text">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
