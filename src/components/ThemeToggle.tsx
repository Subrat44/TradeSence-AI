import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, ThemeMode } from "../context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  variant?: "segmented" | "compact";
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  variant = "segmented",
}) => {
  const { theme, setTheme, resolvedTheme, systemTheme, isSystem } = useTheme();

  const options: { mode: ThemeMode; label: string; icon: React.ReactNode; tooltip: string }[] = [
    {
      mode: "light",
      label: "Light",
      icon: <Sun className="w-3.5 h-3.5" />,
      tooltip: "Light Theme (Institutional Daylight)",
    },
    {
      mode: "dark",
      label: "Dark",
      icon: <Moon className="w-3.5 h-3.5" />,
      tooltip: "Dark Theme (Quant Terminal)",
    },
    {
      mode: "system",
      label: "Desktop",
      icon: <Monitor className="w-3.5 h-3.5" />,
      tooltip: `Desktop Default (${systemTheme === "dark" ? "OS Dark Mode" : "OS Light Mode"} active)`,
    },
  ];

  if (variant === "compact") {
    // Quick single-button cycle or compact dropdown
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <button
          id="btn-theme-quick-toggle"
          onClick={() => {
            if (theme === "dark") setTheme("light");
            else if (theme === "light") setTheme("system");
            else setTheme("dark");
          }}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all shadow-sm"
          title={`Theme: ${theme.toUpperCase()} (Click to toggle)`}
          aria-label="Toggle theme mode"
        >
          {theme === "light" && <Sun className="w-4 h-4 text-amber-500" />}
          {theme === "dark" && <Moon className="w-4 h-4 text-cyan-400" />}
          {theme === "system" && <Monitor className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>
    );
  }

  return (
    <div
      id="left-corner-theme-selector"
      className={`inline-flex items-center p-0.5 rounded-xl bg-slate-950/90 border border-slate-800 shadow-sm backdrop-blur-sm ${className}`}
      role="group"
      aria-label="Select color theme: Light, Dark, or Desktop Default"
    >
      {options.map((opt) => {
        const isSelected = theme === opt.mode;
        return (
          <button
            key={opt.mode}
            id={`theme-btn-${opt.mode}`}
            type="button"
            onClick={() => setTheme(opt.mode)}
            title={opt.tooltip}
            aria-pressed={isSelected}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-mono font-medium transition-all duration-150 select-none ${
              isSelected
                ? "bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60 font-bold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
            }`}
          >
            <span
              className={`transition-transform duration-200 ${
                isSelected ? "scale-110" : "scale-100 opacity-70"
              }`}
            >
              {opt.icon}
            </span>
            <span className="hidden sm:inline text-[11px] leading-none">
              {opt.label}
              {opt.mode === "system" && isSystem && (
                <span className="ml-1 text-[9px] opacity-60">
                  ({systemTheme === "dark" ? "Dark" : "Light"})
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};
