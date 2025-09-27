import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Tables, TablesInsert, Json } from '@/lib/supabase/types';
import type { BoardTemplate, BoardColumn } from '@/lib/boards/templates';

export function useTemplates(teamId?: string, organizationId?: string) {
  const [customTemplates, setCustomTemplates] = useState<Tables<'custom_templates'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!teamId && !organizationId) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    async function fetchTemplates() {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('custom_templates')
          .select('*');

        // Filter by team or organization
        if (teamId) {
          query = query.or(`team_id.eq.${teamId},is_public.eq.true`);
        } else if (organizationId) {
          query = query.or(`organization_id.eq.${organizationId},is_public.eq.true`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        setCustomTemplates(data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, [teamId, organizationId]);

  return { customTemplates, loading, error };
}

export function useCreateCustomTemplate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createTemplate = async (
    template: Omit<TablesInsert<'custom_templates'>, 'id' | 'created_at' | 'updated_at'>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('custom_templates')
        .insert(template)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createTemplate, loading, error };
}

export function useUpdateCustomTemplate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateTemplate = async (
    id: string,
    updates: Partial<Omit<Tables<'custom_templates'>, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('custom_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateTemplate, loading, error };
}

export function useDeleteCustomTemplate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteTemplate = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('custom_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteTemplate, loading, error };
}

export function useTemplatePreferences(userId: string) {
  const [preferences, setPreferences] = useState<{
    preferred_template_id: string | null;
    template_preferences: Json;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    async function fetchPreferences() {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('preferred_template_id, template_preferences')
          .eq('id', userId)
          .single();

        if (error) throw error;
        if (data) {
          setPreferences({
            preferred_template_id: data.preferred_template_id,
            template_preferences: data.template_preferences || {}
          });
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchPreferences();
  }, [userId]);

  const updatePreferences = async (updates: {
    preferred_template_id?: string | null;
    template_preferences?: Json;
  }) => {
    if (!userId) return;

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select('preferred_template_id, template_preferences')
        .single();

      if (error) throw error;
      if (data) {
        setPreferences({
          preferred_template_id: data.preferred_template_id,
          template_preferences: data.template_preferences || {}
        });
        return data;
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return { preferences, updatePreferences, loading, error };
}

export function createRetrospectiveFromTemplate(
  template: BoardTemplate | Tables<'custom_templates'>,
  retrospectiveData: Partial<TablesInsert<'retrospectives'>>
) {
  const columns = 'columns' in template && Array.isArray(template.columns)
    ? template.columns
    : ((template as Tables<'custom_templates'>).columns as unknown) as BoardColumn[];

  return {
    ...retrospectiveData,
    template: template.id,
    // The columns will be created separately in retrospective_columns table
    _columns: columns,
  };
}