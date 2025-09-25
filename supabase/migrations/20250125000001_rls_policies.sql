-- Row Level Security Policies Migration
-- Description: Enables RLS and creates security policies for all tables

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE retrospectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE retrospective_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE retrospective_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can update their organization"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

-- Profiles policies
CREATE POLICY "Users can view profiles in their organization"
  ON profiles FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Teams policies
CREATE POLICY "Users can view teams in their organization"
  ON teams FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams in their organization"
  ON teams FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Team members can update their teams"
  ON teams FOR UPDATE
  USING (
    id IN (
      SELECT team_id FROM team_members
      WHERE profile_id = auth.uid()
    )
  );

-- Team members policies
CREATE POLICY "Users can view team members"
  ON team_members FOR SELECT
  USING (
    team_id IN (
      SELECT teams.id FROM teams
      JOIN profiles ON profiles.organization_id = teams.organization_id
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Team members can add other members"
  ON team_members FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Team members can remove members"
  ON team_members FOR DELETE
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE profile_id = auth.uid()
    )
  );

-- Retrospectives policies
CREATE POLICY "Team members can view their retrospectives"
  ON retrospectives FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create retrospectives"
  ON retrospectives FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update their retrospectives"
  ON retrospectives FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE profile_id = auth.uid()
    )
  );

-- Retrospective columns policies
CREATE POLICY "Team members can view retrospective columns"
  ON retrospective_columns FOR SELECT
  USING (
    retrospective_id IN (
      SELECT id FROM retrospectives
      WHERE team_id IN (
        SELECT team_id FROM team_members
        WHERE profile_id = auth.uid()
      )
    )
  );

CREATE POLICY "Team members can manage retrospective columns"
  ON retrospective_columns FOR ALL
  USING (
    retrospective_id IN (
      SELECT id FROM retrospectives
      WHERE team_id IN (
        SELECT team_id FROM team_members
        WHERE profile_id = auth.uid()
      )
    )
  );

-- Retrospective items policies
CREATE POLICY "Team members can view items"
  ON retrospective_items FOR SELECT
  USING (
    column_id IN (
      SELECT id FROM retrospective_columns
      WHERE retrospective_id IN (
        SELECT id FROM retrospectives
        WHERE team_id IN (
          SELECT team_id FROM team_members
          WHERE profile_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Team members can create items"
  ON retrospective_items FOR INSERT
  WITH CHECK (
    column_id IN (
      SELECT id FROM retrospective_columns
      WHERE retrospective_id IN (
        SELECT id FROM retrospectives
        WHERE team_id IN (
          SELECT team_id FROM team_members
          WHERE profile_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can update their own items"
  ON retrospective_items FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY "Users can delete their own items"
  ON retrospective_items FOR DELETE
  USING (author_id = auth.uid());

-- Votes policies
CREATE POLICY "Team members can view votes"
  ON votes FOR SELECT
  USING (
    item_id IN (
      SELECT id FROM retrospective_items
      WHERE column_id IN (
        SELECT id FROM retrospective_columns
        WHERE retrospective_id IN (
          SELECT id FROM retrospectives
          WHERE team_id IN (
            SELECT team_id FROM team_members
            WHERE profile_id = auth.uid()
          )
        )
      )
    )
  );

CREATE POLICY "Users can manage their own votes"
  ON votes FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Action items policies
CREATE POLICY "Team members can view action items"
  ON action_items FOR SELECT
  USING (
    retrospective_id IN (
      SELECT id FROM retrospectives
      WHERE team_id IN (
        SELECT team_id FROM team_members
        WHERE profile_id = auth.uid()
      )
    )
  );

CREATE POLICY "Team members can manage action items"
  ON action_items FOR ALL
  USING (
    retrospective_id IN (
      SELECT id FROM retrospectives
      WHERE team_id IN (
        SELECT team_id FROM team_members
        WHERE profile_id = auth.uid()
      )
    )
  );