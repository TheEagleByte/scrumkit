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
  CONNECTION_CONFIG,
} from "@/lib/realtime/constants";
import { toast } from "sonner";

type RetrospectiveItem = Database["public"]["Tables"]["retrospective_items"]["Row"];
type Vote = Database["public"]["Tables"]["votes"]["Row"];
type Retrospective = Database["public"]["Tables"]["retrospectives"]["Row"];

import type {
  UserPresence,
  CursorPosition,
  ConnectionState,
  ValidatedCursorData,
  RetrospectiveRealtimeState,
} from '@/lib/realtime/types';

// Alias for consistency with existing code
type PresenceUser = UserPresence;

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

export function useRetrospectiveRealtime(
  retrospectiveId: string,
  currentUser: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  }
): RetrospectiveRealtimeState {
  // State for database data
  const [items, setItems] = useState<RetrospectiveItem[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [retrospective, setRetrospective] = useState<Retrospective | null>(null);

  // State for presence
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);
  const [myPresenceState, setMyPresenceState] = useState<PresenceUser | null>(null);

  // State for cursors with validated type
  const [cursors, setCursors] = useState<Map<string, ValidatedCursorData>>(new Map());
  const lastBroadcast = useRef<number>(0);

  // State for connection
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionState['status']>('connecting');
  const [, setConnectionError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

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

  // Update cursor position with validation
  const lastPosition = useRef({ x: 0, y: 0 });
  const updateCursor = useCallback((x: number, y: number) => {
    // Validate cursor position to prevent XSS
    if (typeof x !== 'number' || typeof y !== 'number' ||
        !isFinite(x) || !isFinite(y) ||
        x < -100 || x > 200 || y < -100 || y > 200) {
      logger.warn('Invalid cursor position', { x, y });
      return;
    }

    // Calculate movement distance (increased threshold from 5px to 10px)
    const distance = Math.sqrt(
      Math.pow(x - lastPosition.current.x, 2) +
      Math.pow(y - lastPosition.current.y, 2)
    );

    const now = Date.now();
    // Only broadcast if moved enough distance AND throttle time passed
    if (channelRef.current &&
        distance >= 10 && // Increased from 5px to 10px
        now - lastBroadcast.current > CURSOR_CONFIG.BROADCAST_THROTTLE) {
      channelRef.current.send({
        type: "broadcast",
        event: "cursor_move",
        payload: {
          userId: currentUser.id,
          x,
          y,
          color: getUserColor(currentUser.id),
          name: currentUser.name,
        },
      });
      lastBroadcast.current = now;
      lastPosition.current = { x, y };
    }
  }, [currentUser.id, currentUser.name, getUserColor]);

  // Update presence data with type safety
  const updatePresence = useCallback(async (data: Partial<UserPresence>): Promise<void> => {
    if (channelRef.current && myPresenceState) {
      const updatedState = { ...myPresenceState, ...data, lastSeen: Date.now() };
      await channelRef.current.track(updatedState);
      setMyPresenceState(updatedState);
    }
  }, [myPresenceState]);

  // Broadcast custom event with type safety
  const broadcast = useCallback(async <T = unknown>(event: string, payload: T): Promise<void> => {
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
      // Database changes - Votes
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
      // Database changes - Retrospective
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
      // Cursor tracking with validated data
      .on("broadcast", { event: "cursor_move" }, ({ payload }) => {
        const data = payload as CursorPosition & { name?: string };
        if (data.userId !== currentUser.id) {
          // Validate cursor data before storing
          if (typeof data.x === 'number' && typeof data.y === 'number' &&
              isFinite(data.x) && isFinite(data.y) &&
              data.x >= -100 && data.x <= 200 && data.y >= -100 && data.y <= 200) {
            setCursors((prev) => {
              const next = new Map(prev);
              const validatedCursor: ValidatedCursorData = {
                x: data.x,
                y: data.y,
                color: data.color,
                userId: data.userId,
                name: data.name,
              };
              next.set(data.userId, validatedCursor);
              return next;
            });
          } else {
            logger.warn('Received invalid cursor data', { data });
          }
        }
      })
      // Subscribe to channel
      .subscribe(async (status) => {
        logger.info(`Channel status: ${status}`, { channel: channelName });
        setIsSubscribed(status === "SUBSCRIBED");

        // Update connection status
        if (status === "SUBSCRIBED") {
          setConnectionStatus("connected");

          // Show reconnection success message if this was a retry
          if (retryCount > 0) {
            setRetryCount(0);
            setConnectionError(null);
            toast.success("Reconnected successfully!", {
              duration: 3000,
            });
          }

          // Track presence once subscribed
          await channel.track(presenceData);
          setMyPresenceState(presenceData);
          logger.debug("Joined presence channel", { channel: channelName, userId: currentUser.id });

          // Load initial data
          loadInitialData();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setConnectionStatus("disconnected");

          // Handle connection errors with retry logic
          const error = new Error(`Connection failed: ${status}`);
          setConnectionError(error);

          // Show user-friendly error message
          if (retryCount === 0) {
            toast.error("Connection lost. Attempting to reconnect...", {
              duration: 4000,
            });
          }

          // Implement exponential backoff retry with proper max limits
          setRetryCount(prev => {
            const nextCount = prev + 1;

            if (nextCount <= CONNECTION_CONFIG.MAX_RETRY_ATTEMPTS) {
              const delay = Math.min(
                CONNECTION_CONFIG.INITIAL_RETRY_DELAY * Math.pow(2, prev),
                CONNECTION_CONFIG.MAX_RETRY_DELAY
              );

              logger.info(`Scheduling reconnection attempt ${nextCount}/${CONNECTION_CONFIG.MAX_RETRY_ATTEMPTS} in ${delay}ms`);

              reconnectTimeoutRef.current = setTimeout(() => {
                logger.info(`Reconnecting... (attempt ${nextCount}/${CONNECTION_CONFIG.MAX_RETRY_ATTEMPTS})`);

                // Resubscribe to channel
                if (channelRef.current) {
                  channelRef.current.subscribe();
                }
              }, delay);
            } else {
              logger.error(`Max retry attempts (${CONNECTION_CONFIG.MAX_RETRY_ATTEMPTS}) reached. Giving up.`);
              toast.error("Unable to establish connection. Please refresh the page.", {
                duration: 0, // Persistent until dismissed
                action: {
                  label: "Refresh",
                  onClick: () => window.location.reload(),
                },
              });
            }

            return nextCount;
          });
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

    // Cleanup with proper memory leak prevention
    return () => {
      // Clear all intervals and timeouts first
      clearInterval(heartbeatInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = undefined;
      }

      // Cleanup channel
      if (channelRef.current) {
        const channel = channelRef.current;
        channelRef.current = null; // Clear ref immediately to prevent usage

        // Get current presence state without causing re-render
        const currentPresence = presenceData;

        // Set presence to offline before leaving
        channel.track({
          ...currentPresence,
          status: 'offline',
          lastSeen: Date.now(),
        }).then(() => {
          channel.untrack();
        }).catch(error => {
          logger.error('Error during cleanup untrack', error);
        }).finally(() => {
          // Remove channel after untracking
          supabase.removeChannel(channel);
        });
      }

      // Clear all state to prevent memory leaks
      setCursors(new Map());
      setPresenceUsers([]);
      setMyPresenceState(null);
      setItems([]);
      setVotes([]);
      setRetrospective(null);
      setConnectionError(null);
      setConnectionStatus('disconnected');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retrospectiveId, currentUser.id, currentUser.name, currentUser.email, currentUser.avatar, getUserColor, loadInitialData]); // Removed myPresenceState and retryCount to prevent memory leaks

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