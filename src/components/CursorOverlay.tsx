"use client";

import { useEffect, useRef } from "react";
import { useCursorTracking } from "@/hooks/use-realtime";
import { motion, AnimatePresence } from "motion/react";

interface CursorOverlayProps {
  channelName: string;
  userId: string;
  userName?: string;
  containerRef?: React.RefObject<HTMLElement>;
}

interface CursorProps {
  x: number;
  y: number;
  color: string;
  userId: string;
  userName?: string;
}

function Cursor({ x, y, color, userName }: CursorProps) {
  return (
    <motion.div
      className="pointer-events-none fixed z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        left: x,
        top: y,
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        className="drop-shadow-md"
      >
        <path
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
          fill={color}
          stroke="white"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {userName && (
        <div
          className="absolute left-2 top-5 rounded-md px-2 py-1 text-xs font-medium text-white shadow-lg"
          style={{
            backgroundColor: color,
          }}
        >
          {userName}
        </div>
      )}
    </motion.div>
  );
}

export function CursorOverlay({
  channelName,
  userId,
  userName,
  containerRef,
}: CursorOverlayProps) {
  const { cursors, updateCursor, isSubscribed } = useCursorTracking(channelName, userId);
  const rafRef = useRef<number>();
  const lastPositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isSubscribed) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        let x = e.clientX;
        let y = e.clientY;

        if (containerRef?.current) {
          const rect = containerRef.current.getBoundingClientRect();
          x = ((e.clientX - rect.left) / rect.width) * 100;
          y = ((e.clientY - rect.top) / rect.height) * 100;
        }

        const distance = Math.sqrt(
          Math.pow(x - lastPositionRef.current.x, 2) +
          Math.pow(y - lastPositionRef.current.y, 2)
        );

        if (distance > 5) {
          updateCursor(x, y);
          lastPositionRef.current = { x, y };
        }
      });
    };

    const handleMouseLeave = () => {
      updateCursor(-100, -100);
    };

    const target = containerRef?.current || document;
    target.addEventListener("mousemove", handleMouseMove as EventListener);
    target.addEventListener("mouseleave", handleMouseLeave as EventListener);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      target.removeEventListener("mousemove", handleMouseMove as EventListener);
      target.removeEventListener("mouseleave", handleMouseLeave as EventListener);
    };
  }, [updateCursor, containerRef, isSubscribed]);

  if (!isSubscribed) return null;

  return (
    <AnimatePresence>
      {Array.from(cursors.entries()).map(([cursorUserId, cursor]) => {
        if (cursor.x < 0 || cursor.y < 0) return null;

        let x = cursor.x;
        let y = cursor.y;

        if (containerRef?.current) {
          const rect = containerRef.current.getBoundingClientRect();
          x = rect.left + (cursor.x / 100) * rect.width;
          y = rect.top + (cursor.y / 100) * rect.height;
        }

        return (
          <Cursor
            key={cursorUserId}
            userId={cursorUserId}
            x={x}
            y={y}
            color={cursor.color}
            userName={cursorUserId === userId ? userName : undefined}
          />
        );
      })}
    </AnimatePresence>
  );
}