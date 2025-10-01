import { useState, useEffect } from "react";

export type ScreenOrientation = "portrait" | "landscape";

export interface OrientationState {
  orientation: ScreenOrientation;
  angle: number;
  isPortrait: boolean;
  isLandscape: boolean;
}

/**
 * Get the current screen orientation
 */
function getOrientation(): OrientationState {
  if (typeof window === "undefined") {
    return {
      orientation: "portrait",
      angle: 0,
      isPortrait: true,
      isLandscape: false,
    };
  }

  // Try using the Screen Orientation API first
  if (window.screen?.orientation) {
    const type = window.screen.orientation.type;
    const angle = window.screen.orientation.angle;

    const isPortrait = type.includes("portrait");
    const isLandscape = type.includes("landscape");

    return {
      orientation: isPortrait ? "portrait" : "landscape",
      angle,
      isPortrait,
      isLandscape,
    };
  }

  // Fallback to window dimensions
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isPortrait = height >= width;

  return {
    orientation: isPortrait ? "portrait" : "landscape",
    angle: isPortrait ? 0 : 90,
    isPortrait,
    isLandscape: !isPortrait,
  };
}

/**
 * Hook to detect and track screen orientation changes
 * @returns Current orientation state
 */
export function useOrientation(): OrientationState {
  const [orientation, setOrientation] =
    useState<OrientationState>(getOrientation);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOrientationChange = () => {
      setOrientation(getOrientation());
    };

    // Listen for orientation changes
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener(
        "change",
        handleOrientationChange
      );
    }

    // Fallback: Listen for resize events
    window.addEventListener("resize", handleOrientationChange);

    // Also listen for orientationchange event (legacy)
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener(
          "change",
          handleOrientationChange
        );
      }
      window.removeEventListener("resize", handleOrientationChange);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  return orientation;
}

/**
 * Hook to check if the device is in portrait mode
 */
export function useIsPortrait(): boolean {
  const { isPortrait } = useOrientation();
  return isPortrait;
}

/**
 * Hook to check if the device is in landscape mode
 */
export function useIsLandscape(): boolean {
  const { isLandscape } = useOrientation();
  return isLandscape;
}
