import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WeeklySubmissionData {
  shifts: Array<{
    date: string;
    start_time: string;
    end_time: string;
    branch_preference: string;
    role_preference?: string;
    notes?: string;
    available_shift_id?: string;
  }>;
  week_start_date: string;
  week_end_date: string;
  notes?: string;
  optional_morning_availability?: number[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { token, shifts, week_start_date, week_end_date, notes, optional_morning_availability } = await req.json() as {
      token: string;
    } & WeeklySubmissionData

    console.log('📤 Processing weekly shift submission:', {
      token: token?.substring(0, 8) + '...',
      shiftsCount: shifts?.length,
      weekStart: week_start_date,
      weekEnd: week_end_date,
      requestBody: { token, shifts, week_start_date, week_end_date, notes, optional_morning_availability }
    })

    // Validate token and get context
    const { data: tokenValidation, error: tokenError } = await supabaseClient
      .from('shift_submission_tokens')
      .select(`
        *,
        employee:employees(
          id,
          first_name,
          last_name,
          employee_id,
          business_id,
          business:businesses(name)
        )
      `)
      .eq('token', token)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (tokenError || !tokenValidation) {
      console.error('❌ Token validation failed:', tokenError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'טוקן לא תקף או פג תוקף' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if this week range matches the token
    const tokenWeekStart = new Date(tokenValidation.week_start_date)
    const tokenWeekEnd = new Date(tokenValidation.week_end_date)
    const submissionWeekStart = new Date(week_start_date)
    const submissionWeekEnd = new Date(week_end_date)

    if (tokenWeekStart.getTime() !== submissionWeekStart.getTime() || 
        tokenWeekEnd.getTime() !== submissionWeekEnd.getTime()) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'טוקן לא תואם לשבוע המבוקש' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if employee has already submitted for this week
    const { data: existingSubmission } = await supabaseClient
      .from('shift_submissions')
      .select('id')
      .eq('employee_id', tokenValidation.employee_id)
      .eq('week_start_date', week_start_date)
      .eq('week_end_date', week_end_date)
      .maybeSingle()

    if (existingSubmission) {
      console.log('⚠️ Employee already submitted for this week:', existingSubmission.id)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'כבר הגשת בחירת משמרות לשבוע זה' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if schedule has been published for this week (any approved shifts)
    const { data: publishedShifts } = await supabaseClient
      .from('scheduled_shifts')
      .select('id')
      .eq('business_id', tokenValidation.business_id)
      .gte('shift_date', week_start_date)
      .lte('shift_date', week_end_date)
      .eq('status', 'approved')

    if (publishedShifts && publishedShifts.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'הסידור לשבוע זה כבר פורסם ולא ניתן לעוד הגשות' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create submission record
    const submissionData = {
      employee_id: tokenValidation.employee_id,
      week_start_date,
      week_end_date,
      shifts: shifts,
      notes: notes || null,
      optional_morning_availability: optional_morning_availability || [],
      submitted_at: new Date().toISOString(),
      status: 'submitted'
    }

    const { data: submission, error: submissionError } = await supabaseClient
      .from('shift_submissions')
      .insert(submissionData)
      .select()
      .single()

    if (submissionError) {
      console.error('❌ Failed to create submission:', submissionError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'שגיאה בשמירת ההגשה' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Increment token usage
    await supabaseClient
      .from('shift_submission_tokens')
      .update({ 
        current_submissions: tokenValidation.current_submissions + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', tokenValidation.id)

    console.log('✅ Token usage incremented. Current submissions:', tokenValidation.current_submissions + 1)

    // Deactivate token if max submissions reached or if this is a single-use token
    if (tokenValidation.current_submissions + 1 >= tokenValidation.max_submissions) {
      console.log('🔒 Deactivating token - max submissions reached')
      await supabaseClient
        .from('shift_submission_tokens')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', tokenValidation.id)
    }

    console.log('✅ Weekly shift submission successful:', {
      submissionId: submission.id,
      employeeId: tokenValidation.employee_id,
      shiftsCount: shifts.length
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        submission: submission,
        message: `${shifts.length} משמרות נשלחו בהצלחה`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('💥 Unexpected error in weekly shift submission:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'שגיאה פנימית בשרת' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})