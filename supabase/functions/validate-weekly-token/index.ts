import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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

    const { token } = await req.json()

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('🔍 Validating weekly token:', token)

    // Query with service role to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('employee_weekly_tokens')
      .select(`
        *,
        employee:employees(first_name, last_name, employee_id, phone, business_id)
      `)
      .eq('token', token)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()  // Use maybeSingle instead of single to avoid error when no data found

    if (error) {
      console.error('❌ Token validation error:', error)
      
      // Check if token exists but is inactive or expired
      const { data: inactiveToken, error: checkError } = await supabaseAdmin
        .from('employee_weekly_tokens')
        .select(`
          *,
          employee:employees(first_name, last_name, employee_id, phone, business_id)
        `)
        .eq('token', token)
        .single()
      
      if (!checkError && inactiveToken) {
        const isExpired = new Date(inactiveToken.expires_at) <= new Date()
        console.log('🔍 Token found but:', {
          isActive: inactiveToken.is_active,
          isExpired,
          expiresAt: inactiveToken.expires_at
        })
        
        return new Response(
          JSON.stringify({ 
            error: isExpired ? 'Token has expired' : 'Token is not active',
            details: { isExpired, isActive: inactiveToken.is_active }
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!data) {
      console.error('❌ No token data returned')
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Token validated successfully:', {
      tokenId: data.id,
      employeeId: data.employee_id,
      weekStart: data.week_start_date,
      weekEnd: data.week_end_date,
      hasEmployeeData: !!data.employee
    })

    return new Response(
      JSON.stringify({ data }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})