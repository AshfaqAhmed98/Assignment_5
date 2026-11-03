"use client";

import { useTheme } from "@/components/theme-provider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <label className="theme-toggle">
      <input
        type="checkbox"
        role="switch"
        aria-label="Dark mode"
        checked={theme === "dark"}
        onChange={toggleTheme}
      />
      <span aria-hidden="true" className="theme-toggle-slider" />
    </label>
  );
}
