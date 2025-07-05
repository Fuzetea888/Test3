import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@complianceos/types';

// =============================================================================
// SUPABASE CLIENT CONFIGURATION
// =============================================================================

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceKey: string;
  jwtSecret: string;
  options?: {
    schema?: string;
    autoRefreshToken?: boolean;
    persistSession?: boolean;
    detectSessionInUrl?: boolean;
    headers?: Record<string, string>;
  };
}

// Environment configuration
const getSupabaseConfig = (): SupabaseConfig => {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const jwtSecret = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET;

  if (!url || !anonKey || !serviceKey || !jwtSecret) {
    throw new Error(
      'Missing required Supabase environment variables. Please check SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, and JWT_SECRET.'
    );
  }

  return {
    url,
    anonKey,
    serviceKey,
    jwtSecret,
    options: {
      schema: 'public',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      headers: {
        'X-Client-Info': 'complianceos-auth@1.0.0',
      },
    },
  };
};

export const supabaseConfig = getSupabaseConfig();

// =============================================================================
// CLIENT INSTANCES
// =============================================================================

// Public client (for frontend)
export const supabase: SupabaseClient<Database> = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  supabaseConfig.options
);

// Service client (for backend operations)
export const supabaseAdmin: SupabaseClient<Database> = createClient(
  supabaseConfig.url,
  supabaseConfig.serviceKey,
  {
    ...supabaseConfig.options,
    autoRefreshToken: false,
    persistSession: false,
  }
);

// =============================================================================
// CLIENT FACTORY
// =============================================================================

export const createSupabaseClient = (
  accessToken?: string
): SupabaseClient<Database> => {
  if (!accessToken) {
    return supabase;
  }

  return createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    ...supabaseConfig.options,
    global: {
      headers: {
        ...supabaseConfig.options?.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
};

// =============================================================================
// UTILITIES
// =============================================================================

export const getServiceSupabase = () => supabaseAdmin;

export const getUserSupabase = (userId: string) => {
  return createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    ...supabaseConfig.options,
    global: {
      headers: {
        ...supabaseConfig.options?.headers,
        'X-User-ID': userId,
      },
    },
  });
};

// =============================================================================
// HEALTH CHECK
// =============================================================================

export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    return !error;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
};

// =============================================================================
// EXPORT CONFIGURATION
// =============================================================================

export { supabaseConfig as config };
export default supabase;