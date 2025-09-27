-- Create custom_templates table for user-created templates
CREATE TABLE IF NOT EXISTS public.custom_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  is_public boolean DEFAULT false,
  columns jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add template preferences to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferred_template_id text,
ADD COLUMN IF NOT EXISTS template_preferences jsonb DEFAULT '{}'::jsonb;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_custom_templates_created_by ON public.custom_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_custom_templates_organization_id ON public.custom_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_custom_templates_team_id ON public.custom_templates(team_id);
CREATE INDEX IF NOT EXISTS idx_custom_templates_is_public ON public.custom_templates(is_public);

-- Enable RLS
ALTER TABLE public.custom_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for custom_templates
CREATE POLICY "Users can view public templates" ON public.custom_templates
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their organization's templates" ON public.custom_templates
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.teams
      WHERE id IN (
        SELECT team_id FROM public.team_members
        WHERE profile_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view their team's templates" ON public.custom_templates
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can create templates for their teams" ON public.custom_templates
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE profile_id = auth.uid()
    ) AND
    (
      organization_id IS NULL OR
      organization_id IN (
        SELECT t.organization_id
        FROM public.teams t
        JOIN public.team_members tm ON t.id = tm.team_id
        WHERE tm.profile_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own templates" ON public.custom_templates
  FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (
    created_by = auth.uid() AND
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE profile_id = auth.uid()
    ) AND
    (
      organization_id IS NULL OR
      organization_id IN (
        SELECT t.organization_id
        FROM public.teams t
        JOIN public.team_members tm ON t.id = tm.team_id
        WHERE tm.profile_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their own templates" ON public.custom_templates
  FOR DELETE USING (created_by = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_custom_templates_updated_at BEFORE UPDATE ON public.custom_templates
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();