import 'react-native-url-polyfill/auto';

import Config from 'react-native-config';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getSupabaseClient() {
  const supabaseUrl = Config.SUPABASE_URL;
  const supabaseKey = Config.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Supabase config missing. Define SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in .env.',
    );
  }

  if (!client) {
    client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  return client;
}
