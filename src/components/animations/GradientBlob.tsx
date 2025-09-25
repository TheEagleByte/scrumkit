"use client";

import { motion } from "motion/react";

interface GradientBlobProps {
  className?: string;
  delay?: number;
  duration?: number;
}

export function GradientBlob({
  className = "",
  delay = 0,
  duration = 20
}: GradientBlobProps) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
      animate={{
        x: [0, 100, 0],
        y: [0, -100, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        background: "radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(59, 130, 246, 0.2) 100%)",
      }}
    />
  );
}