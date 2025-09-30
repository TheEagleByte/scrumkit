"use client";

import { useState, useEffect, useRef } from "react";
import AnimatedLogo from "@/components/AnimatedLogo";

/**
 * Interactive wrapper for AnimatedLogo with hover and initial play functionality
 * @param size - Size of the logo in pixels
 * @param playOnMount - Whether to play animation on mount (only once per session)
 * @param enableHover - Whether to enable hover-to-animate
 * @param sessionKey - Unique key for session storage (prevents re-animation on navigation)
 * @param ariaHidden - Whether to hide from screen readers (for decorative use)
 */
interface InteractiveAnimatedLogoProps {
  size?: number;
  playOnMount?: boolean;
  enableHover?: boolean;
  sessionKey?: string;
  className?: string;
  ariaHidden?: boolean;
}

export default function InteractiveAnimatedLogo({
  size = 32,
  playOnMount = false,
  enableHover = true,
  sessionKey = "logo-animated",
  className = "",
  ariaHidden = false,
}: InteractiveAnimatedLogoProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const cooldownRef = useRef(false);

  // Reactive reduced-motion handling
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Handle initial animation on mount
  useEffect(() => {
    if (!playOnMount || prefersReducedMotion) return;

    // Check if animation has already played this session
    const hasPlayed = sessionStorage.getItem(sessionKey);
    if (!hasPlayed) {
      setIsAnimating(true);
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
      onTouchStart={handleHover}
      onFocus={handleHover}
      className={`inline-block cursor-pointer transition-transform hover:scale-105 ${className}`}
      aria-label={ariaHidden ? undefined : "ScrumKit animated logo - hover to replay animation"}
      aria-hidden={ariaHidden}
      tabIndex={ariaHidden ? -1 : 0}
    >
      <AnimatedLogo
        size={size}
        autoPlay={isAnimating}
        loop={false}
      />
    </div>
  );
}
