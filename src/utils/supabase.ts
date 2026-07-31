/**
 * Supabase client setup with graceful local fallback.
 */

import { createClient } from '@supabase/supabase-js';

// In Vite (browser), VITE_ vars live in import.meta.env — NOT in process.env.
// In Node (server.ts), they live in process.env.
const isBrowser = typeof window !== 'undefined';

const viteEnv = isBrowser ? (import.meta as any).env ?? {} : {};
const nodeEnv = (!isBrowser && typeof process !== 'undefined') ? process.env : {};

export const supabaseUrl =
  viteEnv.VITE_SUPABASE_URL ||
  nodeEnv.VITE_SUPABASE_URL ||
  viteEnv.NEXT_PUBLIC_SUPABASE_URL ||
  nodeEnv.NEXT_PUBLIC_SUPABASE_URL ||
  '';

export const supabaseAnonKey =
  viteEnv.VITE_SUPABASE_ANON_KEY ||
  nodeEnv.VITE_SUPABASE_ANON_KEY ||
  viteEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  nodeEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: any = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
