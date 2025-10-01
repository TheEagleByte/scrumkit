import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types-enhanced";
import type { RealtimeChannelConfig } from "./types";
import { logger } from "@/lib/logger";

export const CHANNEL_NAMES = {
  RETROSPECTIVE: (id: string) => `retrospective:${id}`,
  RETROSPECTIVE_PRESENCE: (id: string) => `retrospective:${id}_presence`,
  RETROSPECTIVE_CURSORS: (id: string) => `retrospective:${id}_cursors`,
  POKER_SESSION: (id: string) => `poker_session:${id}`,
  POKER_PRESENCE: (id: string) => `poker_session:${id}_presence`,
  TEAM_PRESENCE: (teamId: string) => `team:${teamId}_presence`,
  SYSTEM_STATUS: "system:status",
} as const;

export const BROADCAST_EVENTS = {
  CURSOR_MOVE: "cursor_move",
  USER_TYPING: "user_typing",
  ITEM_FOCUS: "item_focus",
  VOTE_ANIMATION: "vote_animation",
  NOTIFICATION: "notification",
  POKER_VOTE_REVEAL: "poker_vote_reveal",
  POKER_STORY_CHANGE: "poker_story_change",
  POKER_TIMER_START: "poker_timer_start",
  POKER_TIMER_STOP: "poker_timer_stop",
} as const;

export const PRESENCE_EVENTS = {
  JOIN: "presence:join",
  LEAVE: "presence:leave",
  UPDATE: "presence:update",
} as const;

export function createRetrospectiveChannel(
  supabase: SupabaseClient<Database>,
  retrospectiveId: string
) {
  const channelName = CHANNEL_NAMES.RETROSPECTIVE(retrospectiveId);

  const channel = supabase.channel(channelName);

  logger.info(`Creating retrospective channel: ${channelName}`);

  return channel;
}

export function createPresenceChannel(
  supabase: SupabaseClient<Database>,
  channelName: string
) {
  return supabase.channel(channelName);
}

export function createBroadcastChannel(
  supabase: SupabaseClient<Database>,
  channelName: string
) {
  return supabase.channel(channelName);
}

interface RealtimePayload<T = unknown> {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: T;
  old: T;
  errors: string[] | null;
}

export function setupRetrospectiveSubscriptions(
  channel: ReturnType<SupabaseClient<Database>["channel"]>,
  retrospectiveId: string,
  handlers: {
    onItemChange?: (payload: RealtimePayload<Database["public"]["Tables"]["retrospective_items"]["Row"]>) => void;
    onVoteChange?: (payload: RealtimePayload<Database["public"]["Tables"]["votes"]["Row"]>) => void;
    onRetrospectiveChange?: (payload: RealtimePayload<Database["public"]["Tables"]["retrospectives"]["Row"]>) => void;
    onActionItemChange?: (payload: RealtimePayload<Database["public"]["Tables"]["action_items"]["Row"]>) => void;
  }
) {
  if (handlers.onItemChange) {
    channel.on(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "postgres_changes" as any,
      {
        event: "*",
        schema: "public",
        table: "retrospective_items",
        filter: `retrospective_id=eq.${retrospectiveId}`,
      },
      handlers.onItemChange
    );
  }

  if (handlers.onVoteChange) {
    channel.on(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "postgres_changes" as any,
      {
        event: "*",
        schema: "public",
        table: "votes",
      },
      handlers.onVoteChange
    );
  }

  if (handlers.onRetrospectiveChange) {
    channel.on(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "postgres_changes" as any,
      {
        event: "UPDATE",
        schema: "public",
        table: "retrospectives",
        filter: `id=eq.${retrospectiveId}`,
      },
      handlers.onRetrospectiveChange
    );
  }

  if (handlers.onActionItemChange) {
    channel.on(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "postgres_changes" as any,
      {
        event: "*",
        schema: "public",
        table: "action_items",
        filter: `retrospective_id=eq.${retrospectiveId}`,
      },
      handlers.onActionItemChange
    );
  }

  return channel;
}

export function handleChannelStatus(
  status: string,
  channelName: string,
  callbacks?: {
    onSubscribed?: () => void;
    onError?: (error: Error) => void;
    onClosed?: () => void;
  }
) {
  switch (status) {
    case "SUBSCRIBED":
      logger.info(`Channel subscribed: ${channelName}`);
      callbacks?.onSubscribed?.();
      break;
    case "CHANNEL_ERROR":
      const error = new Error(`Channel error: ${channelName}`);
      logger.error("Channel subscription error", error);
      callbacks?.onError?.(error);
      break;
    case "CLOSED":
      logger.info(`Channel closed: ${channelName}`);
      callbacks?.onClosed?.();
      break;
    case "TIMED_OUT":
      logger.warn(`Channel timed out: ${channelName}`);
      break;
    default:
      logger.debug(`Channel status: ${status} for ${channelName}`);
  }
}

export async function cleanupChannel(
  supabase: SupabaseClient<Database>,
  channel: ReturnType<SupabaseClient<Database>["channel"]>
) {
  try {
    await channel.unsubscribe();
    await supabase.removeChannel(channel);
    logger.debug(`Channel cleaned up: ${channel.topic}`);
  } catch (error) {
    logger.error("Error cleaning up channel", error as Error);
  }
}

// Planning Poker Channel Functions
export function createPokerSessionChannel(
  supabase: SupabaseClient<Database>,
  sessionId: string
) {
  const channelName = CHANNEL_NAMES.POKER_SESSION(sessionId);
  const channel = supabase.channel(channelName);
  logger.info(`Creating poker session channel: ${channelName}`);
  return channel;
}

export function setupPokerSessionSubscriptions(
  channel: ReturnType<SupabaseClient<Database>["channel"]>,
  sessionId: string,
  handlers: {
    onSessionChange?: (payload: RealtimePayload) => void;
    onStoryChange?: (payload: RealtimePayload) => void;
    onParticipantChange?: (payload: RealtimePayload) => void;
    onVoteChange?: (payload: RealtimePayload) => void;
  }
) {
  if (handlers.onSessionChange) {
    channel.on(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "postgres_changes" as any,
      {
        event: "UPDATE",
        schema: "public",
        table: "poker_sessions",
        filter: `id=eq.${sessionId}`,
      },
      handlers.onSessionChange
    );
  }

  if (handlers.onStoryChange) {
    channel.on(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "postgres_changes" as any,
      {
        event: "*",
        schema: "public",
        table: "poker_stories",
        filter: `session_id=eq.${sessionId}`,
      },
      handlers.onStoryChange
    );
  }

  if (handlers.onParticipantChange) {
    channel.on(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "postgres_changes" as any,
      {
        event: "*",
        schema: "public",
        table: "poker_participants",
        filter: `session_id=eq.${sessionId}`,
      },
      handlers.onParticipantChange
    );
  }

  if (handlers.onVoteChange) {
    channel.on(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "postgres_changes" as any,
      {
        event: "*",
        schema: "public",
        table: "poker_votes",
        filter: `session_id=eq.${sessionId}`,
      },
      handlers.onVoteChange
    );
  }

  return channel;
}