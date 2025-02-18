"use client";

import { useLayoutEffect, useState } from "react";

import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";
import Github from "./logos/GitHub";
import pkg from "@/package.json";

export const Nav = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useLayoutEffect(() => {
    const el = document.documentElement;

    if (el.classList.contains("dark")) {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }
  }, []);

  const toggleDark = () => {
    const el = document.documentElement;
    el.classList.toggle("dark");
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div
      className={
        "px-4 py-2 flex items-center bg-white text-white h-14 z-50 border-b border-border "
      }
    >
      <div>
        <img
          src="https://res.cloudinary.com/dz1iib5rr/image/upload/v1738334727/Screenshot_2025-01-31_201107-removebg-preview_p6jfjk.png"
          alt=""
          className="w-40"
        />
      </div>
      <div className={"ml-auto flex items-center gap-1"}>
        <Button
          onClick={toggleDark}
          variant={"ghost"}
          className={
            "ml-auto flex items-center gap-1.5 rounded-3xl bg-[#1e3470] text-white hover:bg-[#0b1f56] hover:text-white"
          }
        >
          <span>
            {isDarkMode ? (
              <Sun className={"size-4"} />
            ) : (
              <Moon className={"size-4"} />
            )}
          </span>
          <span>{isDarkMode ? "Light" : "Dark"} Mode</span>
        </Button>
      </div>
    </div>
  );
};
