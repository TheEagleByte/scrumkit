-- Performance Indexes and Realtime Migration
-- Description: Adds database indexes for performance and enables realtime subscriptions

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_teams_organization_id ON teams(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_profile_id ON team_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_retrospectives_team_id ON retrospectives(team_id);
CREATE INDEX IF NOT EXISTS idx_retrospectives_status ON retrospectives(status);
CREATE INDEX IF NOT EXISTS idx_retrospectives_created_at ON retrospectives(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_retrospective_columns_retrospective_id ON retrospective_columns(retrospective_id);
CREATE INDEX IF NOT EXISTS idx_retrospective_items_column_id ON retrospective_items(column_id);
CREATE INDEX IF NOT EXISTS idx_retrospective_items_author_id ON retrospective_items(author_id);
CREATE INDEX IF NOT EXISTS idx_retrospective_items_created_at ON retrospective_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_item_id ON votes(item_id);
CREATE INDEX IF NOT EXISTS idx_votes_profile_id ON votes(profile_id);
CREATE INDEX IF NOT EXISTS idx_action_items_retrospective_id ON action_items(retrospective_id);
CREATE INDEX IF NOT EXISTS idx_action_items_assigned_to ON action_items(assigned_to);
CREATE INDEX IF NOT EXISTS idx_action_items_status ON action_items(status);
CREATE INDEX IF NOT EXISTS idx_action_items_due_date ON action_items(due_date);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_retrospectives_team_status ON retrospectives(team_id, status);
CREATE INDEX IF NOT EXISTS idx_team_members_team_profile ON team_members(team_id, profile_id);
CREATE INDEX IF NOT EXISTS idx_votes_item_profile ON votes(item_id, profile_id);

-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE retrospective_items;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
ALTER PUBLICATION supabase_realtime ADD TABLE retrospectives;
ALTER PUBLICATION supabase_realtime ADD TABLE action_items;

-- Add comment documentation for tables
COMMENT ON TABLE organizations IS 'Multi-tenant organizations for team isolation';
COMMENT ON TABLE teams IS 'Development teams within organizations';
COMMENT ON TABLE profiles IS 'User profiles linked to Supabase auth';
COMMENT ON TABLE retrospectives IS 'Sprint retrospective sessions';
COMMENT ON TABLE retrospective_columns IS 'Column types for retrospective boards';
COMMENT ON TABLE retrospective_items IS 'Individual items posted in retrospective columns';
COMMENT ON TABLE votes IS 'User votes on retrospective items';
COMMENT ON TABLE action_items IS 'Follow-up tasks from retrospectives';

-- Add comment documentation for important columns
COMMENT ON COLUMN retrospectives.status IS 'Current status of the retrospective: active, completed, or archived';
COMMENT ON COLUMN action_items.status IS 'Current status of the action item: pending, in_progress, or completed';
COMMENT ON COLUMN team_members.role IS 'Role of the team member: member, lead, or admin';
COMMENT ON COLUMN retrospective_columns.column_type IS 'Type of column: went-well, improve, blockers, or action-items';