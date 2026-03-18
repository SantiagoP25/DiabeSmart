import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const DarkModeToggle = () => {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="w-11 h-11 rounded-full bg-muted flex items-center justify-center soft-press"
      aria-label="Cambiar modo oscuro"
    >
      {dark ? <Sun size={20} className="text-foreground" /> : <Moon size={20} className="text-foreground" />}
    </button>
  );
};

export default DarkModeToggle;
