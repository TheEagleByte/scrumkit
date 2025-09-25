"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
  size?: "default" | "lg";
}

export function AnimatedButton({
  children,
  className,
  variant = "primary",
  size = "default",
  ...props
}: AnimatedButtonProps) {
  const sizeClasses = {
    default: "px-6 py-2.5 text-base",
    lg: "px-8 h-12 text-base"
  };

  if (variant === "primary") {
    return (
      <button
        className={cn(
          "group relative inline-flex items-center justify-center overflow-hidden rounded-lg font-medium transition-all duration-300 hover:scale-105",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {/* Animated rotating gradient border */}
        <span className="absolute inset-0 h-full w-full animate-spin-slow rounded-lg bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 p-[2px]">
          <span className="absolute inset-0 h-full w-full rounded-lg bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 opacity-75 blur-md" />
        </span>

        {/* Inner button with background */}
        <span className="relative z-10 flex h-full w-full items-center justify-center rounded-[6px] bg-white px-8 py-3 text-black transition-colors group-hover:bg-gray-100">
          {/* Shimmer effect */}
          <span className="absolute inset-0 rounded-[6px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 -translate-x-full group-hover:opacity-100 group-hover:animate-shine" />

          <span className="relative">{children}</span>
        </span>
      </button>
    );
  }

  return (
    <button
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden rounded-lg border border-gray-800 font-medium text-white transition-all duration-300 hover:bg-gray-900",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {/* Subtle animated border glow for secondary */}
      <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-violet-600/0 via-purple-600/20 to-violet-600/0 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100 animate-spin-slow" />

      <span className="relative z-10">{children}</span>
    </button>
  );
}