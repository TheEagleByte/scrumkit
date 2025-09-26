"use client";

import { useEffect, useState } from "react";
import { RetrospectiveBoardWithQuery } from "./RetrospectiveBoardWithQuery";
import { getOrCreateAnonymousUser } from "@/lib/boards/anonymous";

interface RetrospectiveBoardWrapperProps {
  retrospectiveId: string;
  teamName: string;
  sprintName: string;
  authenticatedUser?: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
}

export function RetrospectiveBoardWrapper({
  retrospectiveId,
  teamName,
  sprintName,
  authenticatedUser,
}: RetrospectiveBoardWrapperProps) {
  const [boardUser, setBoardUser] = useState(() => {
    // If user is authenticated, use their info
    if (authenticatedUser) {
      return authenticatedUser;
    }

    // Otherwise, generate/retrieve anonymous user (client-side only)
    if (typeof window !== "undefined") {
      const anonUser = getOrCreateAnonymousUser();
      return {
        id: anonUser.id,
        name: anonUser.name,
        email: undefined,
        avatar: undefined,
      };
    }

    // Fallback for SSR
    return {
      id: "anon-loading",
      name: "Loading...",
      email: undefined,
      avatar: undefined,
    };
  });

  useEffect(() => {
    // Only run on client side for anonymous users
    if (!authenticatedUser && typeof window !== "undefined") {
      const anonUser = getOrCreateAnonymousUser();
      setBoardUser({
        id: anonUser.id,
        name: anonUser.name,
        email: undefined,
        avatar: undefined,
      });
    }
  }, [authenticatedUser]);

  return (
    <RetrospectiveBoardWithQuery
      retrospectiveId={retrospectiveId}
      currentUser={boardUser}
      teamName={teamName}
      sprintName={sprintName}
    />
  );
}