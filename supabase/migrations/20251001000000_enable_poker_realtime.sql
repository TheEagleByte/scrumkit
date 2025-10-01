-- Enable Real-time for Planning Poker Tables
-- Description: Enables real-time subscriptions for planning poker tables to support live updates

-- Enable realtime for poker tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE poker_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE poker_stories;
ALTER PUBLICATION supabase_realtime ADD TABLE poker_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE poker_votes;

-- Add comment documentation for realtime behavior
COMMENT ON TABLE poker_sessions IS 'Planning poker sessions with real-time status updates';
COMMENT ON TABLE poker_stories IS 'Stories being estimated with real-time voting updates';
COMMENT ON TABLE poker_participants IS 'Session participants with real-time presence tracking';
COMMENT ON TABLE poker_votes IS 'Participant votes with real-time submission tracking';
