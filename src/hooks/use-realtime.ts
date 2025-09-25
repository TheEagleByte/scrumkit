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
      .on<RetrospectiveItem>(
        "postgres_changes",
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
      .on<Vote>(
        "postgres_changes",
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
      .on<Retrospective>(
        "postgres_changes",
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

    const [itemsResult, votesResult, retroResult] = await Promise.all([
      supabase
        .from("retrospective_items")
        .select("*")
        .eq("retrospective_id", retrospectiveId),
      supabase
        .from("votes")
        .select("*")
        .in("item_id", items.map((i) => i.id)),
      supabase
        .from("retrospectives")
        .select("*")
        .eq("id", retrospectiveId)
        .single(),
    ]);

    if (itemsResult.data) setItems(itemsResult.data);
    if (votesResult.data) setVotes(votesResult.data);
    if (retroResult.data) setRetrospective(retroResult.data);
  }, [retrospectiveId, items]);

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

  useEffect(() => {
    const supabase = createClient();
    const userId = userData.id || `user-${Date.now()}`;

    const presenceData: PresenceUser = {
      id: userId,
      name: userData.name || "Anonymous",
      email: userData.email,
      avatar: userData.avatar,
      color: userData.color || generateUserColor(userId),
      lastSeen: Date.now(),
    };

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

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
        logger.info(`User joined: ${key}`);
      })
      .on("presence", { event: "leave" }, ({ key }: RealtimePresenceLeavePayload<PresenceUser>) => {
        logger.info(`User left: ${key}`);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track(presenceData);
          setMyPresenceState(presenceData);
          logger.info("Joined presence channel", { channel: channelName });
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
    }, 30000);

    return () => {
      clearInterval(heartbeatInterval);
      if (channelRef.current) {
        channelRef.current.untrack();
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [channelName, userData]);

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
  const broadcastThrottle = 50;

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

  const { updatePresence } = usePresence(`${channelName}_presence`, {
    id: userId,
    color: generateUserColor(userId),
  });

  const updateCursor = useCallback(
    (x: number, y: number) => {
      const now = Date.now();
      if (now - lastBroadcast.current > broadcastThrottle) {
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
  const maxRetries = 5;

  useEffect(() => {
    const supabase = createClient();
    let retryTimeout: NodeJS.Timeout;

    const checkConnection = async () => {
      try {
        const { error } = await supabase.auth.getSession();

        if (error) throw error;

        setStatus("connected");
        setRetryCount(0);
        setLastError(null);
      } catch (error) {
        const err = error as Error;
        setLastError(err);
        setStatus("disconnected");

        if (retryCount < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
          logger.warn(`Connection failed, retrying in ${delay}ms`, {
            attempt: retryCount + 1,
            error: err.message,
          });

          retryTimeout = setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            setStatus("connecting");
            checkConnection();
          }, delay);
        }
      }
    };

    checkConnection();

    const channel = supabase.channel("connection_check")
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setStatus("connected");
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setStatus("disconnected");
        } else if (status === "CLOSED") {
          setStatus("connecting");
        }
      });

    const interval = setInterval(checkConnection, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(retryTimeout);
      supabase.removeChannel(channel);
    };
  }, [retryCount]);

  const reconnect = useCallback(() => {
    setRetryCount(0);
    setStatus("connecting");
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
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
    "#F7DC6F", "#BB8FCE", "#85C1E2", "#F8B739", "#52B788",
  ];

  const hash = userId.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + acc;
  }, 0);

  return colors[hash % colors.length];
}