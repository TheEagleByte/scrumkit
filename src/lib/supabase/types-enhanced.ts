/**
 * Enhanced type definitions for Supabase
 * Provides semantic type aliases and utility types
 */

import type { Database as GeneratedDatabase } from './types';

// Semantic type aliases for better code readability
export type UUID = string;
export type Timestamp = string;
export type ISODateString = string;

// Re-export the generated database type
export type Database = GeneratedDatabase;

// Extract table types for easier access
export type Tables = Database['public']['Tables'];

// Individual table types
export type Organization = Tables['organizations']['Row'];
export type Profile = Tables['profiles']['Row'];
export type Team = Tables['teams']['Row'];
export type TeamMember = Tables['team_members']['Row'];
export type Retrospective = Tables['retrospectives']['Row'];
export type RetrospectiveColumn = Tables['retrospective_columns']['Row'];
export type RetrospectiveItem = Tables['retrospective_items']['Row'];
export type Vote = Tables['votes']['Row'];
export type ActionItem = Tables['action_items']['Row'];

// Insert types for creating new records
export type OrganizationInsert = Tables['organizations']['Insert'];
export type ProfileInsert = Tables['profiles']['Insert'];
export type TeamInsert = Tables['teams']['Insert'];
export type TeamMemberInsert = Tables['team_members']['Insert'];
export type RetrospectiveInsert = Tables['retrospectives']['Insert'];
export type RetrospectiveColumnInsert = Tables['retrospective_columns']['Insert'];
export type RetrospectiveItemInsert = Tables['retrospective_items']['Insert'];
export type VoteInsert = Tables['votes']['Insert'];
export type ActionItemInsert = Tables['action_items']['Insert'];

// Update types for updating records
export type OrganizationUpdate = Tables['organizations']['Update'];
export type ProfileUpdate = Tables['profiles']['Update'];
export type TeamUpdate = Tables['teams']['Update'];
export type TeamMemberUpdate = Tables['team_members']['Update'];
export type RetrospectiveUpdate = Tables['retrospectives']['Update'];
export type RetrospectiveColumnUpdate = Tables['retrospective_columns']['Update'];
export type RetrospectiveItemUpdate = Tables['retrospective_items']['Update'];
export type VoteUpdate = Tables['votes']['Update'];
export type ActionItemUpdate = Tables['action_items']['Update'];

// Enum types for specific fields
export type RetrospectiveStatus = 'active' | 'completed' | 'archived';
export type ActionItemStatus = 'pending' | 'in_progress' | 'completed';
export type TeamMemberRole = 'member' | 'lead' | 'admin';
export type ColumnType = 'went-well' | 'improve' | 'blockers' | 'action-items';

// Utility types for common patterns
export type WithTimestamps<T> = T & {
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type WithAuthor<T> = T & {
  author_id: UUID;
  author_name: string;
};

// Response types for Supabase queries
export type SupabaseResponse<T> = {
  data: T | null;
  error: Error | null;
};

// Type guards
export function isUUID(value: unknown): value is UUID {
  if (typeof value !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

export function isTimestamp(value: unknown): value is Timestamp {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

// Helper type for joins
export type RetrospectiveWithColumns = Retrospective & {
  retrospective_columns: RetrospectiveColumn[];
};

export type RetrospectiveColumnWithItems = RetrospectiveColumn & {
  retrospective_items: (RetrospectiveItem & {
    votes: Vote[];
  })[];
};

export type TeamWithMembers = Team & {
  team_members: (TeamMember & {
    profile: Profile;
  })[];
};

// Error types
export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}