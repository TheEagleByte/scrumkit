"use client";

import { motion } from "motion/react";
import { useMemo } from "react";

/**
 * Animated logo component that shows progressive splitting animation
 * @param size - Size of the logo in pixels (default: 128)
 * @param autoPlay - Whether to start animation automatically (default: true)
 * @param loop - Whether to loop the animation (default: true)
 */
export interface AnimatedLogoProps {
  size?: number;
  autoPlay?: boolean;
  loop?: boolean;
}

export default function AnimatedLogo({ size = 128, autoPlay = true, loop = true }: AnimatedLogoProps) {
  const viewBox = "0 0 512 512";

  // Generate unique IDs for this component instance to avoid conflicts
  const uniqueId = useMemo(() => Math.random().toString(36).substring(7), []);

  // Base positions for final state
  const finalPositions = {
    topLeft: { x: 109, y: 112, width: 136, height: 136 },
    topRight: { x: 267, y: 112, width: 136, height: 136 },
    bottomLeft: { x: 109, y: 270, width: 136, height: 136 },
    medTopLeft: { x: 267, y: 270, width: 60, height: 60 },
    medTopRight: { x: 343, y: 270, width: 60, height: 60 },
    medBottomLeft: { x: 267, y: 346, width: 60, height: 60 },
    smallTopLeft: { x: 343, y: 346, width: 28, height: 28 },
    smallTopRight: { x: 375, y: 346, width: 28, height: 28 },
    smallBottomLeft: { x: 343, y: 378, width: 28, height: 28 },
    smallBottomRight: { x: 375, y: 378, width: 28, height: 28 },
  };

  // Animation timing configuration
  const animationDuration = 0.8;
  const pauseBetweenPhases = 0.6;
  const totalCycleDuration = animationDuration * 2 + pauseBetweenPhases * 3;
  const bezierEasing = [0.42, 0, 0.58, 1] as const;

  // Shared gradient colors
  const gradientColors = [
    { start: "#7c3aed", end: "#6d28d9" },
    { start: "#8b5cf6", end: "#7c3aed" },
    { start: "#6d28d9", end: "#5b21b6" },
    { start: "#7c3aed", end: "#6d28d9" },
    { start: "#8b5cf6", end: "#7c3aed" },
    { start: "#6d28d9", end: "#5b21b6" },
    { start: "#8b5cf6", end: "#7c3aed" },
    { start: "#9333ea", end: "#8b5cf6" },
    { start: "#7c3aed", end: "#6d28d9" },
    { start: "#8b5cf6", end: "#7c3aed" },
  ];

  // Helper to create consistent transition config
  const createTransition = (times: number[]) => ({
    duration: totalCycleDuration,
    times,
    ease: bezierEasing,
    repeat: loop ? Infinity : 0,
    repeatDelay: loop ? 1 : 0,
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="overflow-visible"
      role="img"
      aria-label="ScrumKit animated logo showing progressive task breakdown"
    >
      <defs>
        {gradientColors.map((colors, index) => (
          <linearGradient
            key={`gradient-${uniqueId}-${index}`}
            id={`anim-gradient-${uniqueId}-${index + 1}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
        ))}
      </defs>

      {/* Top-left square - splits from full size */}
      <motion.rect
        initial={{ x: 109, y: 112, width: 294, height: 294 }}
        animate={{
          x: [109, 109, finalPositions.topLeft.x, finalPositions.topLeft.x],
          y: [112, 112, finalPositions.topLeft.y, finalPositions.topLeft.y],
          width: [294, 294, finalPositions.topLeft.width, finalPositions.topLeft.width],
          height: [294, 294, finalPositions.topLeft.height, finalPositions.topLeft.height],
        }}
        transition={createTransition([0, 0.15, 0.35, 1])}
        rx="24"
        fill={`url(#anim-gradient-${uniqueId}-1)`}
      />

      {/* Top-right square - appears in stage 1 */}
      <motion.rect
        initial={{ x: 267, y: 112, width: 0, height: 0, opacity: 0 }}
        animate={{
          x: [267, 267, finalPositions.topRight.x, finalPositions.topRight.x],
          y: [112, 112, finalPositions.topRight.y, finalPositions.topRight.y],
          width: [0, 0, finalPositions.topRight.width, finalPositions.topRight.width],
          height: [0, 0, finalPositions.topRight.height, finalPositions.topRight.height],
          opacity: [0, 0, 1, 1],
        }}
        transition={createTransition([0, 0.15, 0.35, 1])}
        rx="24"
        fill={`url(#anim-gradient-${uniqueId}-2)`}
      />

      {/* Bottom-left square - appears in stage 1 */}
      <motion.rect
        initial={{ x: 109, y: 270, width: 0, height: 0, opacity: 0 }}
        animate={{
          x: [109, 109, finalPositions.bottomLeft.x, finalPositions.bottomLeft.x],
          y: [270, 270, finalPositions.bottomLeft.y, finalPositions.bottomLeft.y],
          width: [0, 0, finalPositions.bottomLeft.width, finalPositions.bottomLeft.width],
          height: [0, 0, finalPositions.bottomLeft.height, finalPositions.bottomLeft.height],
          opacity: [0, 0, 1, 1],
        }}
        transition={createTransition([0, 0.15, 0.35, 1])}
        rx="24"
        fill={`url(#anim-gradient-${uniqueId}-3)`}
      />

      {/* Bottom-right large square - appears in stage 1, then splits */}
      <motion.rect
        initial={{ x: 267, y: 270, width: 0, height: 0, opacity: 0 }}
        animate={{
          x: [267, 267, 267, 267, finalPositions.medTopLeft.x, finalPositions.medTopLeft.x],
          y: [270, 270, 270, 270, finalPositions.medTopLeft.y, finalPositions.medTopLeft.y],
          width: [0, 0, 136, 136, finalPositions.medTopLeft.width, finalPositions.medTopLeft.width],
          height: [0, 0, 136, 136, finalPositions.medTopLeft.height, finalPositions.medTopLeft.height],
          opacity: [0, 0, 1, 1, 1, 1],
        }}
        transition={createTransition([0, 0.15, 0.35, 0.50, 0.70, 1])}
        rx="14"
        fill={`url(#anim-gradient-${uniqueId}-4)`}
      />

      {/* Medium squares - appear in stage 2 */}
      <motion.rect
        initial={{ x: 343, y: 270, width: 0, height: 0, opacity: 0 }}
        animate={{
          x: [343, 343, 343, 343, 343, finalPositions.medTopRight.x, finalPositions.medTopRight.x],
          y: [270, 270, 270, 270, 270, finalPositions.medTopRight.y, finalPositions.medTopRight.y],
          width: [0, 0, 0, 0, 0, finalPositions.medTopRight.width, finalPositions.medTopRight.width],
          height: [0, 0, 0, 0, 0, finalPositions.medTopRight.height, finalPositions.medTopRight.height],
          opacity: [0, 0, 0, 0, 0, 1, 1],
        }}
        transition={createTransition([0, 0.15, 0.35, 0.50, 0.50, 0.70, 1])}
        rx="14"
        fill={`url(#anim-gradient-${uniqueId}-5)`}
      />

      <motion.rect
        initial={{ x: 267, y: 346, width: 0, height: 0, opacity: 0 }}
        animate={{
          x: [267, 267, 267, 267, 267, finalPositions.medBottomLeft.x, finalPositions.medBottomLeft.x],
          y: [346, 346, 346, 346, 346, finalPositions.medBottomLeft.y, finalPositions.medBottomLeft.y],
          width: [0, 0, 0, 0, 0, finalPositions.medBottomLeft.width, finalPositions.medBottomLeft.width],
          height: [0, 0, 0, 0, 0, finalPositions.medBottomLeft.height, finalPositions.medBottomLeft.height],
          opacity: [0, 0, 0, 0, 0, 1, 1],
        }}
        transition={createTransition([0, 0.15, 0.35, 0.50, 0.50, 0.70, 1])}
        rx="14"
        fill={`url(#anim-gradient-${uniqueId}-6)`}
      />

      {/* Small squares - appear in stage 2 */}
      <motion.rect
        initial={{ x: 343, y: 346, width: 0, height: 0, opacity: 0 }}
        animate={{
          x: [343, 343, 343, 343, 343, finalPositions.smallTopLeft.x, finalPositions.smallTopLeft.x],
          y: [346, 346, 346, 346, 346, finalPositions.smallTopLeft.y, finalPositions.smallTopLeft.y],
          width: [0, 0, 0, 0, 0, finalPositions.smallTopLeft.width, finalPositions.smallTopLeft.width],
          height: [0, 0, 0, 0, 0, finalPositions.smallTopLeft.height, finalPositions.smallTopLeft.height],
          opacity: [0, 0, 0, 0, 0, 1, 1],
        }}
        transition={createTransition([0, 0.15, 0.35, 0.50, 0.50, 0.70, 1])}
        rx="8"
        fill={`url(#anim-gradient-${uniqueId}-7)`}
      />

      <motion.rect
        initial={{ x: 375, y: 346, width: 0, height: 0, opacity: 0 }}
        animate={{
          x: [375, 375, 375, 375, 375, finalPositions.smallTopRight.x, finalPositions.smallTopRight.x],
          y: [346, 346, 346, 346, 346, finalPositions.smallTopRight.y, finalPositions.smallTopRight.y],
          width: [0, 0, 0, 0, 0, finalPositions.smallTopRight.width, finalPositions.smallTopRight.width],
          height: [0, 0, 0, 0, 0, finalPositions.smallTopRight.height, finalPositions.smallTopRight.height],
          opacity: [0, 0, 0, 0, 0, 1, 1],
        }}
        transition={createTransition([0, 0.15, 0.35, 0.50, 0.50, 0.70, 1])}
        rx="8"
        fill={`url(#anim-gradient-${uniqueId}-8)`}
      />

      <motion.rect
        initial={{ x: 343, y: 378, width: 0, height: 0, opacity: 0 }}
        animate={{
          x: [343, 343, 343, 343, 343, finalPositions.smallBottomLeft.x, finalPositions.smallBottomLeft.x],
          y: [378, 378, 378, 378, 378, finalPositions.smallBottomLeft.y, finalPositions.smallBottomLeft.y],
          width: [0, 0, 0, 0, 0, finalPositions.smallBottomLeft.width, finalPositions.smallBottomLeft.width],
          height: [0, 0, 0, 0, 0, finalPositions.smallBottomLeft.height, finalPositions.smallBottomLeft.height],
          opacity: [0, 0, 0, 0, 0, 1, 1],
        }}
        transition={createTransition([0, 0.15, 0.35, 0.50, 0.50, 0.70, 1])}
        rx="8"
        fill={`url(#anim-gradient-${uniqueId}-9)`}
      />

      <motion.rect
        initial={{ x: 375, y: 378, width: 0, height: 0, opacity: 0 }}
        animate={{
          x: [375, 375, 375, 375, 375, finalPositions.smallBottomRight.x, finalPositions.smallBottomRight.x],
          y: [378, 378, 378, 378, 378, finalPositions.smallBottomRight.y, finalPositions.smallBottomRight.y],
          width: [0, 0, 0, 0, 0, finalPositions.smallBottomRight.width, finalPositions.smallBottomRight.width],
          height: [0, 0, 0, 0, 0, finalPositions.smallBottomRight.height, finalPositions.smallBottomRight.height],
          opacity: [0, 0, 0, 0, 0, 1, 1],
        }}
        transition={createTransition([0, 0.15, 0.35, 0.50, 0.50, 0.70, 1])}
        rx="8"
        fill={`url(#anim-gradient-${uniqueId}-10)`}
      />
    </svg>
  );
}