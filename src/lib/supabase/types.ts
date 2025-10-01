export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      poker_sessions: {
        Row: {
          id: string
          unique_url: string
          title: string
          description: string | null
          team_id: string | null
          created_by: string | null
          creator_cookie: string | null
          estimation_sequence: string | null
          custom_sequence: Json | null
          auto_reveal: boolean | null
          allow_revote: boolean | null
          show_voter_names: boolean | null
          status: string | null
          current_story_id: string | null
          is_anonymous: boolean | null
          is_deleted: boolean | null
          created_at: string | null
          updated_at: string | null
          ended_at: string | null
        }
      }
      poker_stories: {
        Row: {
          id: string
          session_id: string
          title: string
          description: string | null
          acceptance_criteria: string | null
          external_link: string | null
          status: string | null
          final_estimate: string | null
          display_order: number | null
          created_at: string | null
          updated_at: string | null
        }
      }
      poker_participants: {
        Row: {
          id: string
          session_id: string
          profile_id: string | null
          name: string
          avatar_url: string | null
          is_facilitator: boolean | null
          participant_cookie: string | null
          is_observer: boolean | null
          last_seen_at: string | null
          joined_at: string | null
        }
      }
      poker_votes: {
        Row: {
          id: string
          story_id: string
          participant_id: string
          session_id: string
          vote_value: string
          is_revealed: boolean | null
          created_at: string | null
          updated_at: string | null
        }
      }
    }
  }
}
