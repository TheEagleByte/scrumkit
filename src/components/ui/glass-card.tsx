"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function GlassCard({ children, className, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={cn(
        "relative rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-6",
        "hover:border-white/20 hover:bg-white/10 transition-all duration-300",
        "shadow-xl shadow-black/10",
        className
      )}
    >
      {children}
    </motion.div>
  );
}