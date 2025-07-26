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
    const { token, weekStart, weekEnd } = await req.json();

    if (!token || !weekStart || !weekEnd) {
      return new Response(
        JSON.stringify({ error: 'Token, weekStart and weekEnd are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔍 Checking submission status for token:', token?.substring(0, 8) + '...');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate token and get employee information
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('employee_permanent_tokens')
      .select(`
        *,
        employee:employees(
          id,
          first_name,
          last_name,
          business_id
        )
      `)
      .eq('token', token)
      .eq('is_active', true)
      .maybeSingle();

    if (tokenError || !tokenData) {
      console.error('❌ Token validation error:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Invalid or inactive token' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const businessId = tokenData.business_id;
    const employeeId = tokenData.employee_id;
    
    console.log('✅ Token validated for employee:', employeeId, 'business:', businessId);

    // Check if employee has already submitted for this week
    const { data: existingSubmission, error: submissionError } = await supabaseAdmin
      .from('shift_submissions')
      .select('id, status, submitted_at')
      .eq('employee_id', employeeId)
      .eq('week_start_date', weekStart)
      .eq('week_end_date', weekEnd)
      .maybeSingle();

    if (submissionError) {
      console.error('❌ Error checking existing submission:', submissionError);
    }

    // Check if schedule has been published for this week (any approved shifts)
    const { data: publishedShifts, error: publishedError } = await supabaseAdmin
      .from('scheduled_shifts')
      .select('id, status, updated_at')
      .eq('business_id', businessId)
      .gte('shift_date', weekStart)
      .lte('shift_date', weekEnd)
      .eq('status', 'approved');

    if (publishedError) {
      console.error('❌ Error checking published schedule:', publishedError);
    }

    const isSchedulePublished = publishedShifts && publishedShifts.length > 0;
    const hasSubmitted = !!existingSubmission;

    // Determine if submission is blocked
    const isBlocked = hasSubmitted || isSchedulePublished;
    let blockReason = '';
    
    if (hasSubmitted) {
      blockReason = 'כבר הגשת בחירת משמרות לשבוע זה';
    } else if (isSchedulePublished) {
      blockReason = 'הסידור לשבוע זה כבר פורסם';
    }

    const response = {
      success: true,
      canSubmit: !isBlocked,
      isBlocked,
      blockReason,
      hasSubmitted,
      submissionDate: existingSubmission?.submitted_at,
      submissionStatus: existingSubmission?.status,
      isSchedulePublished,
      publishDate: publishedShifts?.[0]?.updated_at,
      weekStart,
      weekEnd
    };

    console.log('📊 Submission status check result:', response);

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