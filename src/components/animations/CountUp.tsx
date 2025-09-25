"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUp({
  end,
  duration = 2,
  prefix = "",
  suffix = "",
  className = "",
}: CountUpProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (isInView) {
      // If user prefers reduced motion, show the final value immediately
      if (prefersReducedMotion) {
        setCount(end);
        return;
      }
      let startTime: number;
      let animationFrame: number;

      const animateCount = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

        setCount(Math.floor(progress * end));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animateCount);
        }
      };

      animationFrame = requestAnimationFrame(animateCount);

      // Cleanup function to cancel animation on unmount
      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }
  }, [isInView, end, duration, prefersReducedMotion]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
    >
      {prefix}{count}{suffix}
    </motion.span>
  );
}