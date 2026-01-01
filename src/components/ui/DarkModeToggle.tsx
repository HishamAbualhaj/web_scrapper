"use client";
import { Moon, Sun } from "lucide-react";
import { useLocale } from "next-intl";
import { useState } from "react";

const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(true);

  const locale = useLocale();
  return (
    <div
      onClick={() => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle("dark");
      }}
      className="border hover:border-yellow-500/80 w-14 rounded-2xl border-gray-400/50 p-0.75 cursor-pointer"
    >
      <div
        className={`bg-gray-400/40 w-fit rounded-2xl p-0.75 ${
          isDark
            ? "translate-x-0"
            : `${
                locale === "en"
                  ? "translate-x-[calc(100%+9.5px)]"
                  : "-translate-x-[calc(100%+9.5px)]"
              }`
        } transition`}
      >
        {isDark ? <Moon size={13} /> : <Sun size={13} />}
      </div>
    </div>
  );
};

export default DarkModeToggle;
