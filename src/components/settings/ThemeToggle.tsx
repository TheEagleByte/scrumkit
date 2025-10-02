"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 opacity-50">
          <div className="h-4 w-4 rounded-full bg-muted" />
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <RadioGroup value={theme} onValueChange={setTheme}>
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="light" id="light" />
          <Label
            htmlFor="light"
            className="flex items-center gap-2 cursor-pointer font-normal"
          >
            <Sun className="h-4 w-4" />
            <div className="flex flex-col">
              <span>Light</span>
              <span className="text-xs text-muted-foreground">
                Light mode theme
              </span>
            </div>
          </Label>
        </div>

        <div className="flex items-center space-x-3">
          <RadioGroupItem value="dark" id="dark" />
          <Label
            htmlFor="dark"
            className="flex items-center gap-2 cursor-pointer font-normal"
          >
            <Moon className="h-4 w-4" />
            <div className="flex flex-col">
              <span>Dark</span>
              <span className="text-xs text-muted-foreground">
                Dark mode theme
              </span>
            </div>
          </Label>
        </div>

        <div className="flex items-center space-x-3">
          <RadioGroupItem value="system" id="system" />
          <Label
            htmlFor="system"
            className="flex items-center gap-2 cursor-pointer font-normal"
          >
            <Monitor className="h-4 w-4" />
            <div className="flex flex-col">
              <span>System</span>
              <span className="text-xs text-muted-foreground">
                Follow system preference
              </span>
            </div>
          </Label>
        </div>
      </div>
    </RadioGroup>
  );
}
