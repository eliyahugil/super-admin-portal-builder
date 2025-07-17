import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📥 Request received, method:', req.method);
    console.log('📥 Request headers:', Object.fromEntries(req.headers.entries()));
    
    const body = await req.json();
    console.log('📥 Request body:', body);
    
    const { token } = body;

    if (!token) {
      console.log('❌ No token provided in request');
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔍 Getting weekly shifts context for token:', token);
    console.log('🔍 Using SUPABASE_URL:', Deno.env.get('SUPABASE_URL'));
    console.log('🔍 Using SERVICE_ROLE_KEY:', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'Present' : 'Missing');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get token data with employee and business information
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('employee_weekly_tokens')
      .select(`
        *,
        employee:employees(
          id,
          first_name,
          last_name,
          employee_id,
          phone,
          business_id,
          business:businesses(id, name)
        )
      `)
      .eq('token', token)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError) {
      console.error('❌ Token validation error:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const businessId = tokenData.employee.business_id;
    const employeeId = tokenData.employee_id;
    const weekStart = tokenData.week_start_date;
    const weekEnd = tokenData.week_end_date;

    console.log('✅ Token validated for employee:', employeeId, 'business:', businessId, 'week:', weekStart, 'to', weekEnd);
    console.log('🔍 Token data details:', {
      tokenId: tokenData.id,
      employeeName: `${tokenData.employee.first_name} ${tokenData.employee.last_name}`,
      businessName: tokenData.employee.business.name,
      weekDates: { start: weekStart, end: weekEnd }
    });

    // Get available shifts for this week - search by date range instead of exact week match
    console.log('📋 Getting available shifts for week:', weekStart, 'to', weekEnd);
    
    const { data: availableShifts, error: availableError } = await supabaseAdmin
      .from('available_shifts')
      .select(`
        *,
        branch:branches(id, name, address),
        business:businesses(id, name)
      `)
      .eq('business_id', businessId)
      .or(`and(week_start_date.lte.${weekStart},week_end_date.gte.${weekEnd}),and(week_start_date.gte.${weekStart},week_start_date.lte.${weekEnd})`)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (availableError) {
      console.error('❌ Error fetching available shifts:', availableError);
      throw availableError;
    }

    console.log('🔍 Available shifts query result:', {
      shiftsFound: availableShifts?.length || 0,
      shifts: availableShifts,
      queryParams: { businessId, weekStart, weekEnd }
    });

    const shifts = availableShifts || [];
    
    // Context for showing available shifts
    const context = {
      type: 'available_shifts',
      title: 'הגשת משמרות לשבוע הקרוב',
      description: shifts.length > 0 
        ? 'בחר את המשמרות שברצונך לעבוד השבוע והגש את בקשתך'
        : 'טרם הוגדרו משמרות זמינות לשבוע זה. אנא פנה למנהל העבודה.',
      shiftsPublished: false
    };

    console.log('✅ Found', shifts.length, 'scheduled shifts for employee');
    console.log('📝 Context type:', context.type);

    const response = {
      success: true,
      tokenData: {
        id: tokenData.id,
        token: tokenData.token,
        employeeId: tokenData.employee_id,
        weekStart: tokenData.week_start_date,
        weekEnd: tokenData.week_end_date,
        expiresAt: tokenData.expires_at,
        employee: tokenData.employee
      },
      context,
      shifts,
      shiftsCount: shifts.length
    };

    console.log('🎉 Successfully prepared weekly shifts context');

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});