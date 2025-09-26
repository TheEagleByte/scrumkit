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
  CONNECTION_CONFIG,
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

interface RealtimeEvent<T = unknown> {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: T;
  old: T;
}

export function useRetrospectiveRealtime(retrospectiveId: string) {
  const [items, setItems] = useState<RetrospectiveItem[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [retrospective, setRetrospective] = useState<Retrospective | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`retrospective:${retrospectiveId}`)
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      .subscribe((status) => {
        setIsSubscribed(status === "SUBSCRIBED");
        logger.info(`Retrospective channel status: ${status}`);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [retrospectiveId]);

  const loadInitialData = useCallback(async () => {
    const supabase = createClient();

    // First load items and retrospective
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

      // Load votes based on fetched items, not state
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

  useEffect(() => {
    if (isSubscribed) {
      loadInitialData();
    }
  }, [isSubscribed, loadInitialData]);

  return {
    items,
    votes,
    retrospective,
    isSubscribed,
    refetch: loadInitialData,
  };
}

export function usePresence(channelName: string, userData: Partial<PresenceUser>) {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [myPresenceState, setMyPresenceState] = useState<PresenceUser | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Destructure the specific values we need to avoid object reference issues
  const { id: userDataId, name: userDataName, email: userDataEmail, avatar: userDataAvatar, color: userDataColor } = userData;

  useEffect(() => {
    const supabase = createClient();
    const userId = userDataId || `user-${Date.now()}`;

    const presenceData: PresenceUser = {
      id: userId,
      name: userDataName || "Anonymous",
      email: userDataEmail,
      avatar: userDataAvatar,
      color: userDataColor || generateUserColor(userId),
      lastSeen: Date.now(),
    };

    // Don't specify the key in config - Supabase will generate a UUID key
    // The actual user data is in the tracked payload
    const channel = supabase.channel(channelName);

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceUser>();
        const usersList = Object.values(state).flatMap((presences) =>
          presences.map((p) => p as PresenceUser)
        );
        setUsers(usersList);
        logger.debug("Presence sync", { users: usersList });
      })
      .on("presence", { event: "join" }, ({ key }: RealtimePresenceJoinPayload<PresenceUser>) => {
        logger.debug(`User joined: ${key}`);
      })
      .on("presence", { event: "leave" }, ({ key }: RealtimePresenceLeavePayload<PresenceUser>) => {
        logger.debug(`User left: ${key}`);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track(presenceData);
          setMyPresenceState(presenceData);
          logger.debug("Joined presence channel", { channel: channelName, userId });
        }
      });

    channelRef.current = channel;

    const heartbeatInterval = setInterval(() => {
      if (channelRef.current) {
        channelRef.current.track({
          ...presenceData,
          lastSeen: Date.now(),
        });
      }
    }, PRESENCE_CONFIG.HEARTBEAT_INTERVAL);

    return () => {
      clearInterval(heartbeatInterval);
      if (channelRef.current) {
        channelRef.current.untrack();
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [channelName, userDataId, userDataName, userDataEmail, userDataAvatar, userDataColor]);

  const updatePresence = useCallback(async (data: Partial<PresenceUser>) => {
    if (channelRef.current && myPresenceState) {
      const updatedState = { ...myPresenceState, ...data, lastSeen: Date.now() };
      await channelRef.current.track(updatedState);
      setMyPresenceState(updatedState);
    }
  }, [myPresenceState]);

  return {
    users,
    myPresenceState,
    updatePresence,
    activeUsersCount: users.length,
  };
}

export function useBroadcast<T = unknown>(
  channelName: string,
  eventName: string,
  onReceive?: (payload: T) => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(channelName)
      .on("broadcast", { event: eventName }, ({ payload }) => {
        if (onReceive) {
          onReceive(payload as T);
        }
      })
      .subscribe((status) => {
        setIsSubscribed(status === "SUBSCRIBED");
        logger.debug(`Broadcast channel status: ${status}`, { channel: channelName });
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [channelName, eventName, onReceive]);

  const broadcast = useCallback(async (payload: T) => {
    if (channelRef.current && isSubscribed) {
      await channelRef.current.send({
        type: "broadcast",
        event: eventName,
        payload,
      });
    }
  }, [eventName, isSubscribed]);

  return {
    broadcast,
    isSubscribed,
  };
}

export function useCursorTracking(channelName: string, userId: string) {
  const [cursors, setCursors] = useState<Map<string, { x: number; y: number; color: string }>>(
    new Map()
  );
  const lastBroadcast = useRef<number>(0);

  const { broadcast, isSubscribed } = useBroadcast<{
    userId: string;
    x: number;
    y: number;
    color: string;
  }>(channelName, "cursor_move", (payload) => {
    if (payload.userId !== userId) {
      setCursors((prev) => {
        const next = new Map(prev);
        next.set(payload.userId, {
          x: payload.x,
          y: payload.y,
          color: payload.color,
        });
        return next;
      });
    }
  });

  // Use the same channel for presence to avoid splitting users across channels
  const { updatePresence } = usePresence(channelName, {
    id: userId,
    color: generateUserColor(userId),
  });

  const updateCursor = useCallback(
    (x: number, y: number) => {
      const now = Date.now();
      if (now - lastBroadcast.current > CURSOR_CONFIG.BROADCAST_THROTTLE) {
        broadcast({
          userId,
          x,
          y,
          color: generateUserColor(userId),
        });
        updatePresence({ cursor: { x, y } });
        lastBroadcast.current = now;
      }
    },
    [broadcast, userId, updatePresence]
  );

  const removeCursor = useCallback((userId: string) => {
    setCursors((prev) => {
      const next = new Map(prev);
      next.delete(userId);
      return next;
    });
  }, []);

  return {
    cursors,
    updateCursor,
    removeCursor,
    isSubscribed,
  };
}

export function useConnectionStatus() {
  const [status, setStatus] = useState<"connected" | "connecting" | "disconnected">("connecting");
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let retryTimeout: NodeJS.Timeout;

    // Simply use channel subscription status to determine connection
    // This works for both authenticated and anonymous users
    const channel = supabase
      .channel("connection_check")
      .subscribe((status) => {
        logger.debug("Connection channel status", { status });

        if (status === "SUBSCRIBED") {
          setStatus("connected");
          setRetryCount(0);
          setLastError(null);
          logger.info("Real-time connection established");
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          const error = new Error(`Channel ${status}`);
          setLastError(error);
          setStatus("disconnected");

          // Implement retry logic
          if (retryCount < CONNECTION_CONFIG.MAX_RETRY_ATTEMPTS) {
            const delay = Math.min(
              CONNECTION_CONFIG.INITIAL_RETRY_DELAY * Math.pow(2, retryCount),
              CONNECTION_CONFIG.MAX_RETRY_DELAY
            );

            logger.warn(`Connection failed, retrying in ${delay}ms`, {
              attempt: retryCount + 1,
              status,
            });

            setStatus("connecting");
            setRetryCount((prev) => prev + 1);

            retryTimeout = setTimeout(() => {
              // Remove old channel and create new one
              supabase.removeChannel(channel);
              // Recursively call setup again by triggering useEffect
              setRetryCount(0);
            }, delay);
          }
        } else if (status === "CLOSED") {
          setStatus("connecting");
        }
      });

    channelRef.current = channel;

    return () => {
      clearTimeout(retryTimeout);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  const reconnect = useCallback(() => {
    const supabase = createClient();

    // Remove old channel if exists
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    setRetryCount(0);
    setStatus("connecting");

    // Create new connection
    const channel = supabase
      .channel("connection_check")
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setStatus("connected");
          setRetryCount(0);
          setLastError(null);
        }
      });

    channelRef.current = channel;
  }, []);

  return {
    status,
    retryCount,
    lastError,
    isConnected: status === "connected",
    isConnecting: status === "connecting",
    isDisconnected: status === "disconnected",
    reconnect,
  };
}

function generateUserColor(userId: string): string {
  // Improved hash function to reduce collisions
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  const index = Math.abs(hash) % USER_COLORS.length;
  return USER_COLORS[index];
}