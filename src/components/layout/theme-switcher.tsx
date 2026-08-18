"use client";

import { useEffect, useState } from "react";

type Theme = "current" | "new-web";

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("current");

  useEffect(() => {
    const saved = (window.localStorage.getItem("pih-ci-theme") as Theme | null) || "current";
    setTheme(saved);
    document.documentElement.dataset.pihTheme = saved;
  }, []);

  function apply(next: Theme) {
    setTheme(next);
    window.localStorage.setItem("pih-ci-theme", next);
    document.documentElement.dataset.pihTheme = next;
  }

  return (
    <div className="ci-switcher flex items-center rounded-full border border-border bg-card p-1 text-xs font-semibold" aria-label="PIH visual theme">
      <button type="button" onClick={() => apply("current")} className={`rounded-full px-3 py-1.5 transition ${theme === "current" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
        Current CI
      </button>
      <button type="button" onClick={() => apply("new-web")} className={`rounded-full px-3 py-1.5 transition ${theme === "new-web" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
        New Web CI
      </button>
    </div>
  );
}
