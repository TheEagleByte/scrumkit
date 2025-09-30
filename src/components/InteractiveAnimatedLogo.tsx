"use client";

import { useState, useEffect, useRef } from "react";
import AnimatedLogo from "@/components/AnimatedLogo";

/**
 * Interactive wrapper for AnimatedLogo with hover and initial play functionality
 * @param size - Size of the logo in pixels
 * @param playOnMount - Whether to play animation on mount (only once per session)
 * @param enableHover - Whether to enable hover-to-animate
 * @param sessionKey - Unique key for session storage (prevents re-animation on navigation)
 */
interface InteractiveAnimatedLogoProps {
  size?: number;
  playOnMount?: boolean;
  enableHover?: boolean;
  sessionKey?: string;
  className?: string;
}

export default function InteractiveAnimatedLogo({
  size = 32,
  playOnMount = false,
  enableHover = true,
  sessionKey = "logo-animated",
  className = "",
}: InteractiveAnimatedLogoProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasPlayedOnMount, setHasPlayedOnMount] = useState(false);
  const cooldownRef = useRef(false);
  const prefersReducedMotion = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  // Handle initial animation on mount
  useEffect(() => {
    if (!playOnMount || prefersReducedMotion) return;

    // Check if animation has already played this session
    const hasPlayed = sessionStorage.getItem(sessionKey);
    if (!hasPlayed) {
      setIsAnimating(true);
      setHasPlayedOnMount(true);
      sessionStorage.setItem(sessionKey, "true");

      // Animation duration is ~2.8 seconds (from component)
      setTimeout(() => {
        setIsAnimating(false);
      }, 2800);
    }
  }, [playOnMount, sessionKey, prefersReducedMotion]);

  // Handle hover interaction
  const handleHover = () => {
    if (!enableHover || prefersReducedMotion || cooldownRef.current) return;

    // Start animation
    setIsAnimating(true);
    cooldownRef.current = true;

    // Animation duration + cooldown
    setTimeout(() => {
      setIsAnimating(false);
    }, 2800);

    // Cooldown period to prevent spam (3.5 seconds)
    setTimeout(() => {
      cooldownRef.current = false;
    }, 3500);
  };

  return (
    <div
      onMouseEnter={handleHover}
      className={`inline-block cursor-pointer transition-transform hover:scale-105 ${className}`}
      aria-label="ScrumKit animated logo - hover to replay animation"
    >
      <AnimatedLogo
        size={size}
        autoPlay={isAnimating}
        loop={false}
      />
    </div>
  );
}
