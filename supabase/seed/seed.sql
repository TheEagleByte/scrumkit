-- Seed data for development and testing

-- Insert a sample organization
INSERT INTO organizations (id, name, slug)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Demo Organization', 'demo-org')
ON CONFLICT (slug) DO NOTHING;

-- Note: Profiles will be created when users sign up through auth

-- Insert sample teams
INSERT INTO teams (id, organization_id, name, description)
VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Development Team Alpha', 'Frontend and backend development team'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'QA Team', 'Quality assurance and testing team')
ON CONFLICT (organization_id, name) DO NOTHING;

-- Insert a sample retrospective
INSERT INTO retrospectives (id, team_id, sprint_number, sprint_name, status)
VALUES
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   24, 'Sprint 24', 'active')
ON CONFLICT DO NOTHING;

-- Insert retrospective columns
INSERT INTO retrospective_columns (retrospective_id, column_type, title, description, color, display_order)
VALUES
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'went-well', 'What went well?',
   'Celebrate successes and positive outcomes', 'bg-green-500/10 border-green-500/20', 1),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'improve', 'What could be improved?',
   'Identify areas for enhancement', 'bg-yellow-500/10 border-yellow-500/20', 2),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'blockers', 'What blocked us?',
   'Obstacles and impediments faced', 'bg-red-500/10 border-red-500/20', 3),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'action-items', 'Action items',
   'Next steps and commitments', 'bg-blue-500/10 border-blue-500/20', 4)
ON CONFLICT (retrospective_id, column_type) DO NOTHING;

-- Get column IDs for inserting items
WITH column_ids AS (
  SELECT
    id,
    column_type
  FROM retrospective_columns
  WHERE retrospective_id = 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
)
-- Insert sample retrospective items
INSERT INTO retrospective_items (column_id, text, author_name)
SELECT
  ci.id,
  CASE
    WHEN ci.column_type = 'went-well' THEN 'Successfully delivered the user authentication feature ahead of schedule'
    WHEN ci.column_type = 'improve' THEN 'Code review process took longer than expected'
    WHEN ci.column_type = 'blockers' THEN 'Third-party API downtime affected testing'
    WHEN ci.column_type = 'action-items' THEN 'Set up automated code review reminders'
  END,
  CASE
    WHEN ci.column_type = 'went-well' THEN 'Sarah Chen'
    WHEN ci.column_type = 'improve' THEN 'Alex Rivera'
    WHEN ci.column_type = 'blockers' THEN 'David Kim'
    WHEN ci.column_type = 'action-items' THEN 'Team Decision'
  END
FROM column_ids ci
ON CONFLICT DO NOTHING;

-- Add another item to 'went-well'
INSERT INTO retrospective_items (column_id, text, author_name)
SELECT
  id,
  'Great collaboration between frontend and backend teams',
  'Mike Johnson'
FROM retrospective_columns
WHERE retrospective_id = 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  AND column_type = 'went-well'
ON CONFLICT DO NOTHING;

-- Add another item to 'improve'
INSERT INTO retrospective_items (column_id, text, author_name)
SELECT
  id,
  'Need better documentation for API endpoints',
  'Emma Davis'
FROM retrospective_columns
WHERE retrospective_id = 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  AND column_type = 'improve'
ON CONFLICT DO NOTHING;