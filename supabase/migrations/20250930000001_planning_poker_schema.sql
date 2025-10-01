-- Planning Poker Schema Migration
-- Description: Creates tables for planning poker functionality

-- Create poker_sessions table
CREATE TABLE IF NOT EXISTS poker_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unique_url VARCHAR(255) UNIQUE NOT NULL DEFAULT generate_unique_url(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  creator_cookie VARCHAR(255), -- For anonymous session creators

  -- Session settings
  estimation_sequence VARCHAR(50) DEFAULT 'fibonacci', -- fibonacci, tshirt, linear, powers-of-2, custom
  custom_sequence JSONB, -- For custom sequences
  auto_reveal BOOLEAN DEFAULT false, -- Auto-reveal when all participants vote
  allow_revote BOOLEAN DEFAULT true, -- Allow changing vote before reveal
  show_voter_names BOOLEAN DEFAULT true, -- Show who voted vs anonymous

  -- Session state
  status VARCHAR(50) DEFAULT 'active', -- active, ended, archived
  current_story_id UUID, -- Reference to current story being voted on

  -- Metadata
  is_anonymous BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,

  CONSTRAINT valid_status CHECK (status IN ('active', 'ended', 'archived'))
);

-- Create poker_stories table
CREATE TABLE IF NOT EXISTS poker_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES poker_sessions(id) ON DELETE CASCADE,

  -- Story details
  title TEXT NOT NULL,
  description TEXT,
  acceptance_criteria TEXT,
  external_link VARCHAR(500), -- Link to Jira, GitHub, etc.

  -- Story state
  status VARCHAR(50) DEFAULT 'pending', -- pending, voting, revealed, estimated, skipped
  final_estimate VARCHAR(50), -- The agreed-upon estimate
  display_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_story_status CHECK (status IN ('pending', 'voting', 'revealed', 'estimated', 'skipped'))
);

-- Create poker_participants table
CREATE TABLE IF NOT EXISTS poker_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES poker_sessions(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Participant info
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  is_facilitator BOOLEAN DEFAULT false,
  participant_cookie VARCHAR(255), -- For anonymous participants

  -- Participant state
  is_observer BOOLEAN DEFAULT false, -- Observers can watch but not vote
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  joined_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(session_id, profile_id),
  UNIQUE(session_id, participant_cookie)
);

-- Create poker_votes table
CREATE TABLE IF NOT EXISTS poker_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES poker_stories(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES poker_participants(id) ON DELETE CASCADE,

  -- Vote details
  vote_value VARCHAR(50) NOT NULL, -- The estimate value (could be number, ?, coffee, etc.)
  is_revealed BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(story_id, participant_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_poker_sessions_unique_url ON poker_sessions(unique_url);
CREATE INDEX idx_poker_sessions_team_id ON poker_sessions(team_id);
CREATE INDEX idx_poker_sessions_creator_cookie ON poker_sessions(creator_cookie);
CREATE INDEX idx_poker_sessions_status ON poker_sessions(status);
CREATE INDEX idx_poker_sessions_is_deleted ON poker_sessions(is_deleted);

CREATE INDEX idx_poker_stories_session_id ON poker_stories(session_id);
CREATE INDEX idx_poker_stories_status ON poker_stories(status);
CREATE INDEX idx_poker_stories_display_order ON poker_stories(session_id, display_order);

CREATE INDEX idx_poker_participants_session_id ON poker_participants(session_id);
CREATE INDEX idx_poker_participants_profile_id ON poker_participants(profile_id);
CREATE INDEX idx_poker_participants_participant_cookie ON poker_participants(participant_cookie);

CREATE INDEX idx_poker_votes_story_id ON poker_votes(story_id);
CREATE INDEX idx_poker_votes_participant_id ON poker_votes(participant_id);

-- Add updated_at triggers
CREATE TRIGGER update_poker_sessions_updated_at BEFORE UPDATE ON poker_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_poker_stories_updated_at BEFORE UPDATE ON poker_stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_poker_votes_updated_at BEFORE UPDATE ON poker_votes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE poker_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE poker_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE poker_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE poker_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for poker_sessions
-- Anyone can read active sessions
CREATE POLICY "Anyone can read non-deleted poker sessions"
  ON poker_sessions FOR SELECT
  USING (is_deleted = false);

-- Authenticated users can create sessions
CREATE POLICY "Authenticated users can create poker sessions"
  ON poker_sessions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Anonymous users can also create sessions (checked via creator_cookie)
CREATE POLICY "Anyone can create poker sessions"
  ON poker_sessions FOR INSERT
  TO anon
  WITH CHECK (true);

-- Session creators can update their sessions
CREATE POLICY "Creators can update their poker sessions"
  ON poker_sessions FOR UPDATE
  USING (
    (auth.uid() IS NOT NULL AND created_by = auth.uid())
    OR
    (is_anonymous = true AND creator_cookie IS NOT NULL)
  );

-- Session creators can delete their sessions
CREATE POLICY "Creators can delete their poker sessions"
  ON poker_sessions FOR DELETE
  USING (
    (auth.uid() IS NOT NULL AND created_by = auth.uid())
    OR
    (is_anonymous = true AND creator_cookie IS NOT NULL)
  );

-- RLS Policies for poker_stories
-- Anyone can read stories from active sessions
CREATE POLICY "Anyone can read poker stories"
  ON poker_stories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM poker_sessions
      WHERE id = session_id AND is_deleted = false
    )
  );

-- Facilitators and creators can manage stories
CREATE POLICY "Facilitators can insert poker stories"
  ON poker_stories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM poker_sessions ps
      WHERE ps.id = session_id
      AND (
        ps.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM poker_participants pp
          WHERE pp.session_id = ps.id
          AND pp.profile_id = auth.uid()
          AND pp.is_facilitator = true
        )
      )
    )
  );

CREATE POLICY "Facilitators can update poker stories"
  ON poker_stories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM poker_sessions ps
      WHERE ps.id = session_id
      AND (
        ps.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM poker_participants pp
          WHERE pp.session_id = ps.id
          AND pp.profile_id = auth.uid()
          AND pp.is_facilitator = true
        )
      )
    )
  );

CREATE POLICY "Facilitators can delete poker stories"
  ON poker_stories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM poker_sessions ps
      WHERE ps.id = session_id
      AND (
        ps.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM poker_participants pp
          WHERE pp.session_id = ps.id
          AND pp.profile_id = auth.uid()
          AND pp.is_facilitator = true
        )
      )
    )
  );

-- RLS Policies for poker_participants
-- Anyone can read participants from active sessions
CREATE POLICY "Anyone can read poker participants"
  ON poker_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM poker_sessions
      WHERE id = session_id AND is_deleted = false
    )
  );

-- Anyone can join as a participant
CREATE POLICY "Anyone can join poker sessions"
  ON poker_participants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM poker_sessions
      WHERE id = session_id AND status = 'active'
    )
  );

-- Participants can update their own info
CREATE POLICY "Participants can update their own info"
  ON poker_participants FOR UPDATE
  USING (
    profile_id = auth.uid()
    OR participant_cookie IS NOT NULL
  );

-- Facilitators can remove participants
CREATE POLICY "Facilitators can remove participants"
  ON poker_participants FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM poker_sessions ps
      WHERE ps.id = session_id
      AND ps.created_by = auth.uid()
    )
    OR is_facilitator = true
  );

-- RLS Policies for poker_votes
-- Participants can read all votes (visibility controlled by is_revealed flag)
CREATE POLICY "Participants can read poker votes"
  ON poker_votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM poker_participants pp
      JOIN poker_stories ps ON ps.session_id = pp.session_id
      WHERE ps.id = story_id
      AND (pp.profile_id = auth.uid() OR pp.participant_cookie IS NOT NULL)
    )
  );

-- Participants can submit votes
CREATE POLICY "Participants can submit votes"
  ON poker_votes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM poker_participants pp
      JOIN poker_stories ps ON ps.session_id = pp.session_id
      WHERE ps.id = story_id
      AND (pp.profile_id = auth.uid() OR pp.participant_cookie IS NOT NULL)
      AND pp.is_observer = false
    )
  );

-- Participants can update their own votes (if revoting allowed)
CREATE POLICY "Participants can update their votes"
  ON poker_votes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM poker_participants pp
      WHERE pp.id = participant_id
      AND (pp.profile_id = auth.uid() OR pp.participant_cookie IS NOT NULL)
    )
  );

-- Participants can delete their own votes
CREATE POLICY "Participants can delete their votes"
  ON poker_votes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM poker_participants pp
      WHERE pp.id = participant_id
      AND (pp.profile_id = auth.uid() OR pp.participant_cookie IS NOT NULL)
    )
  );

-- Add foreign key constraint for current_story_id (after poker_stories table exists)
ALTER TABLE poker_sessions
  ADD CONSTRAINT fk_current_story
  FOREIGN KEY (current_story_id)
  REFERENCES poker_stories(id)
  ON DELETE SET NULL;
