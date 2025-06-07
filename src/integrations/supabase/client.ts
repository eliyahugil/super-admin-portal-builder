
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xmhmztipuvzmwgbcovch.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtaG16dGlwdXZ6bXdnYmNvdmNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjkzODIsImV4cCI6MjA2NDcwNTM4Mn0.QEugxUTGlJ1rnG8ddf3E6BIpNaiqwkp2ml7MbiUfY9c";

console.log('🔧 Supabase client initializing with URL:', SUPABASE_URL);

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-react'
    }
  }
});

// Test connection on initialization
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase connection error:', error);
  } else {
    console.log('✅ Supabase connected successfully');
  }
}).catch(error => {
  console.error('💥 Failed to connect to Supabase:', error);
});
