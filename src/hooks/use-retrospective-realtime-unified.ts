"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  RealtimeChannel,
  RealtimePresenceJoinPayload,
  RealtimePresenceLeavePayload,
} from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types-enhanced";
import { logger } from "@/lib/logger";
import {
  PRESENCE_CONFIG,
  CURSOR_CONFIG,
  USER_COLORS,
} from "@/lib/realtime/constants";

type RetrospectiveItem = Database["public"]["Tables"]["retrospective_items"]["Row"];
type Vote = Database["public"]["Tables"]["votes"]["Row"];
type Retrospective = Database["public"]["Tables"]["retrospectives"]["Row"];

interface PresenceUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  color?: string;
  cursor?: { x: number; y: number };
  lastSeen: number;
}

interface CursorData {
  x: number;
  y: number;
  color: string;
}

interface RealtimeEvent<T = unknown> {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: T;
  old: T;
}

/**
 * Unified real-time hook for retrospective boards
 * Manages all real-time features through a single channel:
 * - Database changes (items, votes, retrospective)
 * - Presence tracking
 * - Cursor tracking
 * - Connection status
 */
export function useUnifiedRetrospectiveRealtime(
  retrospectiveId: string,
  currentUser: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  }
) {
  // State for database data
  const [items, setItems] = useState<RetrospectiveItem[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [retrospective, setRetrospective] = useState<Retrospective | null>(null);

  // State for presence
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);
  const [myPresenceState, setMyPresenceState] = useState<PresenceUser | null>(null);

  // State for cursors
  const [cursors, setCursors] = useState<Map<string, CursorData>>(new Map());
  const lastBroadcast = useRef<number>(0);

  // State for connection
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");

  // Channel reference
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Generate user color
  const getUserColor = useCallback((userId: string): string => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const index = Math.abs(hash) % USER_COLORS.length;
    return USER_COLORS[index];
  }, []);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    const supabase = createClient();

    const [itemsResult, retroResult] = await Promise.all([
      supabase
        .from("retrospective_items")
        .select("*")
        .eq("retrospective_id", retrospectiveId),
      supabase
        .from("retrospectives")
        .select("*")
        .eq("id", retrospectiveId)
        .single(),
    ]);

    if (itemsResult.data) {
      setItems(itemsResult.data);

      const itemIds = itemsResult.data.map(item => item.id);
      if (itemIds.length > 0) {
        const votesResult = await supabase
          .from("votes")
          .select("*")
          .in("item_id", itemIds);

        if (votesResult.data) setVotes(votesResult.data);
      }
    }

    if (retroResult.data) setRetrospective(retroResult.data);
  }, [retrospectiveId]);

  // Update cursor position
  const updateCursor = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (channelRef.current && now - lastBroadcast.current > CURSOR_CONFIG.BROADCAST_THROTTLE) {
      channelRef.current.send({
        type: "broadcast",
        event: "cursor_move",
        payload: {
          userId: currentUser.id,
          x,
          y,
          color: getUserColor(currentUser.id),
        },
      });
      lastBroadcast.current = now;
    }
  }, [currentUser.id, getUserColor]);

  // Update presence data
  const updatePresence = useCallback(async (data: Partial<PresenceUser>) => {
    if (channelRef.current && myPresenceState) {
      const updatedState = { ...myPresenceState, ...data, lastSeen: Date.now() };
      await channelRef.current.track(updatedState);
      setMyPresenceState(updatedState);
    }
  }, [myPresenceState]);

  // Broadcast custom event
  const broadcast = useCallback(async (event: string, payload: unknown) => {
    if (channelRef.current && isSubscribed) {
      await channelRef.current.send({
        type: "broadcast",
        event,
        payload,
      });
    }
  }, [isSubscribed]);

  // Main effect to set up the channel
  useEffect(() => {
    const supabase = createClient();
    const channelName = `retrospective:${retrospectiveId}`;

    // Prepare presence data
    const presenceData: PresenceUser = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      avatar: currentUser.avatar,
      color: getUserColor(currentUser.id),
      lastSeen: Date.now(),
    };

    // Create single channel for everything
    const channel = supabase
      .channel(channelName)
      // Database changes - Items
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "retrospective_items",
          filter: `retrospective_id=eq.${retrospectiveId}`,
        },
        (payload: RealtimeEvent<RetrospectiveItem>) => {
          const { eventType, new: newItem, old: oldItem } = payload;

          switch (eventType) {
            case "INSERT":
              setItems((prev) => [...prev, newItem]);
              logger.info("New item added", { item: newItem });
              break;
            case "UPDATE":
              setItems((prev) =>
                prev.map((item) => (item.id === newItem.id ? newItem : item))
              );
              logger.info("Item updated", { item: newItem });
              break;
            case "DELETE":
              setItems((prev) => prev.filter((item) => item.id !== oldItem.id));
              logger.info("Item deleted", { item: oldItem });
              break;
          }
        }
      )
      // Database changes - Votes
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "votes",
        },
        (payload: RealtimeEvent<Vote>) => {
          const { eventType, new: newVote, old: oldVote } = payload;

          switch (eventType) {
            case "INSERT":
              setVotes((prev) => [...prev, newVote]);
              break;
            case "DELETE":
              setVotes((prev) => prev.filter((vote) => vote.id !== oldVote.id));
              break;
          }
        }
      )
      // Database changes - Retrospective
      .on(
        "postgres_changes" as any,
        {
          event: "UPDATE",
          schema: "public",
          table: "retrospectives",
          filter: `id=eq.${retrospectiveId}`,
        },
        (payload: RealtimeEvent<Retrospective>) => {
          setRetrospective(payload.new);
          logger.info("Retrospective updated", { retrospective: payload.new });
        }
      )
      // Presence tracking
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceUser>();
        const usersList = Object.values(state).flatMap((presences) =>
          presences.map((p) => p as PresenceUser)
        );
        setPresenceUsers(usersList);
        logger.debug("Presence sync", { users: usersList });
      })
      .on("presence", { event: "join" }, ({ key }: RealtimePresenceJoinPayload<PresenceUser>) => {
        logger.debug(`User joined: ${key}`);
      })
      .on("presence", { event: "leave" }, ({ key }: RealtimePresenceLeavePayload<PresenceUser>) => {
        logger.debug(`User left: ${key}`);
      })
      // Cursor tracking
      .on("broadcast", { event: "cursor_move" }, ({ payload }) => {
        const data = payload as { userId: string; x: number; y: number; color: string };
        if (data.userId !== currentUser.id) {
          setCursors((prev) => {
            const next = new Map(prev);
            next.set(data.userId, {
              x: data.x,
              y: data.y,
              color: data.color,
            });
            return next;
          });
        }
      })
      // Subscribe to channel
      .subscribe(async (status) => {
        logger.info(`Channel status: ${status}`, { channel: channelName });
        setIsSubscribed(status === "SUBSCRIBED");

        // Update connection status
        if (status === "SUBSCRIBED") {
          setConnectionStatus("connected");

          // Track presence once subscribed
          await channel.track(presenceData);
          setMyPresenceState(presenceData);
          logger.debug("Joined presence channel", { channel: channelName, userId: currentUser.id });

          // Load initial data
          loadInitialData();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setConnectionStatus("disconnected");
        } else {
          setConnectionStatus("connecting");
        }
      });

    channelRef.current = channel;

    // Heartbeat for presence
    const heartbeatInterval = setInterval(() => {
      if (channelRef.current && myPresenceState) {
        channelRef.current.track({
          ...myPresenceState,
          lastSeen: Date.now(),
        });
      }
    }, PRESENCE_CONFIG.HEARTBEAT_INTERVAL);

    // Cleanup
    return () => {
      clearInterval(heartbeatInterval);
      if (channelRef.current) {
        channelRef.current.untrack();
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [retrospectiveId, currentUser.id, currentUser.name, currentUser.email, currentUser.avatar, getUserColor, loadInitialData]);

  // Compute derived values
  const otherUsers = presenceUsers.filter(user => user.id !== currentUser.id);
  const activeUsersCount = presenceUsers.length;

  return {
    // Database data
    items,
    votes,
    retrospective,

    // Presence
    presenceUsers,
    otherUsers,
    activeUsersCount,
    myPresenceState,
    updatePresence,

    // Cursors
    cursors,
    updateCursor,

    // Connection
    isSubscribed,
    connectionStatus,

    // Utilities
    broadcast,
    refetch: loadInitialData,
  };
}