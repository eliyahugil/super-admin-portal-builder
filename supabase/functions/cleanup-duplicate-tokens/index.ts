import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🧹 Starting token cleanup...')

    // Delete all tokens for the current week (2025-07-20 to 2025-07-26)
    const { data: deletedTokens, error: deleteError } = await supabaseAdmin
      .from('employee_weekly_tokens')
      .delete()
      .eq('week_start_date', '2025-07-20')
      .eq('week_end_date', '2025-07-26')

    if (deleteError) {
      console.error('❌ Delete error:', deleteError)
      throw deleteError
    }

    console.log('✅ Cleaned up duplicate tokens')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Duplicate tokens cleaned up successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('💥 Cleanup error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to cleanup tokens' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})