"use client";

import { motion } from "motion/react";
import { letterAnimation, staggerContainer } from "@/lib/animations";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function AnimatedText({ text, className = "", delay = 0 }: AnimatedTextProps) {
  const words = text.split(" ");

  return (
    <motion.span
      className={`inline-block ${className}`}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      style={{ perspective: 1000 }}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block">
          {word.split("").map((letter, letterIndex) => (
            <motion.span
              key={`${wordIndex}-${letterIndex}`}
              className="inline-block"
              variants={letterAnimation}
              custom={delay + (wordIndex * word.length + letterIndex) * 0.03}
              style={{ transformStyle: "preserve-3d" }}
            >
              {letter}
            </motion.span>
          ))}
          {wordIndex < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </motion.span>
  );
}