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

// Strongly typed presence state
export interface UserPresence {
  readonly id: string;
  readonly name: string;
  readonly email?: string;
  readonly avatar?: string;
  readonly color: string;
  readonly cursor?: CursorCoordinates;
  readonly lastSeen: number;
  readonly status?: PresenceStatus;
}

// Cursor coordinates with validation bounds
export interface CursorCoordinates {
  readonly x: number; // Should be 0-100 for percentage or -100 for hidden
  readonly y: number; // Should be 0-100 for percentage or -100 for hidden
}

// Presence status enum for type safety
export type PresenceStatus = "active" | "away" | "offline" | "online";

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

// Validated cursor data for safe rendering
export interface ValidatedCursorData {
  readonly x: number;
  readonly y: number;
  readonly color: string;
  readonly name?: string;
  readonly userId: string;
}

// Real-time hook return type for better type safety
export interface RetrospectiveRealtimeState {
  readonly items: Database["public"]["Tables"]["retrospective_items"]["Row"][];
  readonly votes: Database["public"]["Tables"]["votes"]["Row"][];
  readonly retrospective: Database["public"]["Tables"]["retrospectives"]["Row"] | null;
  readonly presenceUsers: UserPresence[];
  readonly otherUsers: UserPresence[];
  readonly activeUsersCount: number;
  readonly myPresenceState: UserPresence | null;
  readonly cursors: Map<string, ValidatedCursorData>;
  readonly isSubscribed: boolean;
  readonly connectionStatus: ConnectionState['status'];
  readonly updatePresence: (data: Partial<UserPresence>) => Promise<void>;
  readonly updateCursor: (x: number, y: number) => void;
  readonly broadcast: <T = unknown>(event: string, payload: T) => Promise<void>;
  readonly refetch: () => Promise<void>;
}