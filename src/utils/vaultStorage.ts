import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Load a data array from Supabase vault_data table.
 * Falls back to the provided fallback if Supabase is not configured or no data found.
 */
export async function loadVaultData<T>(key: string, fallback: T[]): Promise<T[]> {
  if (!isSupabaseConfigured || !supabase) return fallback;

  const { data, error } = await supabase
    .from('vault_data')
    .select('data')
    .eq('key', key)
    .maybeSingle();

  if (error || !data) return fallback;
  const result = data.data as T[];
  return Array.isArray(result) && result.length > 0 ? result : fallback;
}

/**
 * Save a data array to Supabase vault_data table (upsert by user + key).
 * Silently no-ops if Supabase is not configured or user is not authenticated.
 */
export async function saveVaultData<T>(key: string, items: T[]): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('vault_data')
    .upsert(
      { user_id: user.id, key, data: items, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,key' }
    );

  if (error && error.code !== 'PGRST116') {
    // Suppress 404/table-not-found errors silently; log others
    if (!error.message?.includes('404') && !error.message?.includes('relation') && error.code !== '42P01') {
      console.warn('saveVaultData error:', error.message);
    }
  }
}
