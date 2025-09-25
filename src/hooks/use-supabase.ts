"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types-enhanced";
import { logger } from "@/lib/logger";

/**
 * Custom hook to access Supabase client with error handling
 */
export function useSupabase() {
  const [supabase] = useState<SupabaseClient<Database>>(() => createClient());
  const [isConnected, setIsConnected] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Monitor connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) throw error;
        setIsConnected(true);
        setRetryCount(0);
      } catch (error) {
        logger.warn('Supabase connection issue', {
          retryCount,
          error: (error as Error).message,
        });
        setIsConnected(false);

        // Implement exponential backoff retry
        if (retryCount < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, delay);
        }
      }
    };

    checkConnection();

    // Check connection periodically
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, [supabase, retryCount]);

  // Wrapper for queries with error handling
  const query = useCallback(async <T,>(
    queryFn: (client: SupabaseClient<Database>) => Promise<{ data: T | null; error: Error | null }>
  ): Promise<{ data: T | null; error: Error | null }> => {
    try {
      const result = await queryFn(supabase);

      if (result.error) {
        logger.error('Supabase query error', result.error);

        // Retry on network errors
        if (result.error.message?.includes('network') && retryCount < maxRetries) {
          setRetryCount(prev => prev + 1);
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
          return queryFn(supabase);
        }
      }

      return result;
    } catch (error) {
      logger.error('Unexpected query error', error as Error);
      return { data: null, error: error as Error };
    }
  }, [supabase, retryCount]);

  return {
    supabase,
    isConnected,
    query,
    retryCount,
  };
}

/**
 * Hook for real-time subscriptions with automatic reconnection
 */
export function useRealtimeSubscription<T = unknown>(
  tableName: string,
  filter?: Record<string, unknown>,
  onInsert?: (payload: T) => void,
  onUpdate?: (payload: T) => void,
  onDelete?: (payload: T) => void
) {
  const { supabase, isConnected } = useSupabase();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isConnected) {
      logger.debug('Waiting for connection to establish subscription');
      return;
    }

    let channel: ReturnType<typeof supabase.channel> | undefined;

    const setupSubscription = async () => {
      try {
        // Build the channel with filters if provided
        let query = supabase.channel(`${tableName}_changes`);

        if (filter) {
          query = query.on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: tableName,
              filter: Object.entries(filter)
                .map(([key, value]) => `${key}=eq.${value}`)
                .join('&')
            },
            (payload: { eventType: string; new: unknown; old: unknown }) => {
              const { eventType, new: newRecord, old: oldRecord } = payload;

              switch (eventType) {
                case 'INSERT':
                  onInsert?.(newRecord as T);
                  break;
                case 'UPDATE':
                  onUpdate?.(newRecord as T);
                  break;
                case 'DELETE':
                  onDelete?.(oldRecord as T);
                  break;
              }
            }
          );
        } else {
          query = query.on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: tableName
            },
            (payload: { eventType: string; new: unknown; old: unknown }) => {
              const { eventType, new: newRecord, old: oldRecord } = payload;

              switch (eventType) {
                case 'INSERT':
                  onInsert?.(newRecord as T);
                  break;
                case 'UPDATE':
                  onUpdate?.(newRecord as T);
                  break;
                case 'DELETE':
                  onDelete?.(oldRecord as T);
                  break;
              }
            }
          );
        }

        channel = query.subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            setIsSubscribed(true);
            setError(null);
            logger.info(`Subscribed to ${tableName} changes`);
          } else if (status === 'CLOSED') {
            setIsSubscribed(false);
            logger.info(`Subscription to ${tableName} closed`);
          } else if (status === 'CHANNEL_ERROR') {
            setIsSubscribed(false);
            const err = new Error(`Subscription error for ${tableName}`);
            setError(err);
            logger.error('Realtime subscription error', err);
          }
        });

      } catch (err) {
        const error = err as Error;
        setError(error);
        logger.error('Failed to setup subscription', error, { tableName });
      }
    };

    setupSubscription();

    return () => {
      if (channel) {
        logger.debug(`Unsubscribing from ${tableName}`);
        supabase.removeChannel(channel);
      }
    };
  }, [supabase, tableName, filter, onInsert, onUpdate, onDelete, isConnected]);

  return {
    isSubscribed,
    error,
  };
}