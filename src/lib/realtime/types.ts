import type { Database } from "@/lib/supabase/types-enhanced";

export type RealtimeEvent<T = unknown> = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: T;
  old: T;
  errors: string[] | null;
};

export type PresenceState<T = unknown> = {
  [key: string]: T[];
};

export type BroadcastMessage<T = unknown> = {
  event: string;
  payload: T;
  type: "broadcast";
};

export type CursorPosition = {
  userId: string;
  x: number;
  y: number;
  color: string;
  timestamp: number;
};

export type UserPresence = {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  color: string;
  cursor?: { x: number; y: number };
  lastSeen: number;
  status?: "active" | "away" | "offline" | "online";
};

export type RealtimeChannelStatus =
  | "SUBSCRIBED"
  | "TIMED_OUT"
  | "CLOSED"
  | "CHANNEL_ERROR";

export type RetrospectiveRealtimePayload = {
  items: RealtimeEvent<Database["public"]["Tables"]["retrospective_items"]["Row"]>;
  votes: RealtimeEvent<Database["public"]["Tables"]["votes"]["Row"]>;
  retrospective: RealtimeEvent<Database["public"]["Tables"]["retrospectives"]["Row"]>;
  actionItems: RealtimeEvent<Database["public"]["Tables"]["action_items"]["Row"]>;
};

export type ConnectionState = {
  status: "connected" | "connecting" | "disconnected" | "reconnecting";
  latency: number | null;
  lastError: Error | null;
  retryCount: number;
  retryAfter: number | null;
};

export interface RealtimeChannelConfig {
  name: string;
  presence?: boolean;
  broadcast?: boolean;
  private?: boolean;
  params?: Record<string, unknown>;
}

export interface RealtimeSubscriptionOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  autoReconnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}