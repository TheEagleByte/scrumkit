// Planning Poker types and interfaces

export type EstimationSequenceType = 'fibonacci' | 'tshirt' | 'linear' | 'powers-of-2' | 'custom';

export type SessionStatus = 'active' | 'ended' | 'archived';

export type StoryStatus = 'pending' | 'voting' | 'revealed' | 'estimated' | 'skipped';

export interface EstimationSequence {
  type: EstimationSequenceType;
  name: string;
  values: (string | number)[];
  specialValues?: string[]; // For special cards like '?', 'coffee'
}

export interface SessionSettings {
  estimationSequence: EstimationSequenceType;
  customSequence?: (string | number)[];
  autoReveal: boolean;
  allowRevote: boolean;
  showVoterNames: boolean;
}

export interface PokerSession {
  id: string;
  unique_url: string;
  title: string;
  description?: string | null;
  team_id?: string | null;
  created_by?: string | null;
  creator_cookie?: string | null;

  // Settings
  estimation_sequence: EstimationSequenceType;
  custom_sequence?: (string | number)[] | null;
  auto_reveal: boolean;
  allow_revote: boolean;
  show_voter_names: boolean;

  // State
  status: SessionStatus;
  current_story_id?: string | null;

  // Metadata
  is_anonymous: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  ended_at?: string | null;
}

export interface PokerStory {
  id: string;
  session_id: string;
  title: string;
  description?: string | null;
  acceptance_criteria?: string | null;
  external_link?: string | null;
  status: StoryStatus;
  final_estimate?: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PokerParticipant {
  id: string;
  session_id: string;
  profile_id?: string | null;
  name: string;
  avatar_url?: string | null;
  is_facilitator: boolean;
  is_observer: boolean;
  participant_cookie?: string | null;
  last_seen_at: string;
  joined_at: string;
}

export interface PokerVote {
  id: string;
  story_id: string;
  participant_id: string;
  session_id: string;
  vote_value: string;
  is_revealed: boolean;
  created_at: string;
  updated_at: string;
}

// Enhanced types with relations
export interface PokerSessionWithStories extends PokerSession {
  stories: PokerStory[];
  participants: PokerParticipant[];
}

export interface PokerStoryWithVotes extends PokerStory {
  votes: (PokerVote & { participant: PokerParticipant })[];
}

// Input types for creating/updating
export interface CreatePokerSessionInput {
  title: string;
  description?: string;
  settings?: Partial<SessionSettings>;
  teamId?: string;
}

export interface UpdatePokerSessionInput {
  title?: string;
  description?: string;
  settings?: Partial<SessionSettings>;
  status?: SessionStatus;
  currentStoryId?: string | null;
}

export interface CreatePokerStoryInput {
  sessionId: string;
  title: string;
  description?: string;
  acceptance_criteria?: string;
  external_link?: string;
  display_order?: number;
}

export interface UpdatePokerStoryInput {
  title?: string;
  description?: string;
  acceptance_criteria?: string;
  external_link?: string;
  status?: StoryStatus;
  final_estimate?: string;
  display_order?: number;
}

export interface CreatePokerParticipantInput {
  sessionId: string;
  name: string;
  avatar_url?: string;
  is_facilitator?: boolean;
  is_observer?: boolean;
}

export interface SubmitPokerVoteInput {
  storyId: string;
  participantId: string;
  voteValue: string;
}

// Helper type for session data from story queries
export interface StorySessionInfo {
  id: string;
  unique_url: string;
  creator_cookie: string;
  team_id: string | null;
}
