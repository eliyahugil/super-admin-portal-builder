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
    const { businessId } = await req.json()
    
    if (!businessId) {
      return new Response(
        JSON.stringify({ error: 'Business ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('🤖 Starting auto-scheduling for business:', businessId)

    // Get auto-scheduling settings
    const { data: settings, error: settingsError } = await supabase
      .from('auto_scheduling_settings')
      .select('*')
      .eq('business_id', businessId)
      .single()

    if (settingsError || !settings?.auto_schedule_enabled) {
      return new Response(
        JSON.stringify({ 
          error: 'Auto scheduling is not enabled for this business',
          message: 'אנא הפעל סידור אוטומטי בהגדרות תחילה'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get employees for this business
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)

    if (employeesError) throw employeesError

    // Get branches for this business
    const { data: branches, error: branchesError } = await supabase
      .from('branches')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)

    if (branchesError) throw branchesError

    // Get unassigned shifts for the next weeks
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(startDate.getDate() + (settings.schedule_weeks_ahead * 7))

    const { data: unassignedShifts, error: shiftsError } = await supabase
      .from('scheduled_shifts')
      .select('*')
      .eq('business_id', businessId)
      .is('employee_id', null)
      .gte('shift_date', startDate.toISOString().split('T')[0])
      .lte('shift_date', endDate.toISOString().split('T')[0])
      .eq('is_archived', false)

    if (shiftsError) throw shiftsError

    console.log(`📊 Found ${unassignedShifts?.length || 0} unassigned shifts`)

    // Simple auto-assignment algorithm
    let assignedCount = 0
    const assignments = []

    for (const shift of unassignedShifts || []) {
      // Get available employees (simple logic - first available)
      const availableEmployees = employees?.filter(emp => {
        // Basic availability check - you can enhance this with more complex rules
        return emp.is_active
      }) || []

      if (availableEmployees.length > 0) {
        // Simple assignment: pick first available employee
        const selectedEmployee = availableEmployees[0]
        
        // Check if employee is already assigned to another shift on the same date
        const { data: existingShifts } = await supabase
          .from('scheduled_shifts')
          .select('id')
          .eq('employee_id', selectedEmployee.id)
          .eq('shift_date', shift.shift_date)
          .eq('is_archived', false)

        if (!existingShifts || existingShifts.length === 0) {
          // Assign employee to shift
          const { error: assignError } = await supabase
            .from('scheduled_shifts')
            .update({ 
              employee_id: selectedEmployee.id,
              is_assigned: true,
              status: 'pending'
            })
            .eq('id', shift.id)

          if (!assignError) {
            assignedCount++
            assignments.push({
              shift_id: shift.id,
              employee_id: selectedEmployee.id,
              employee_name: `${selectedEmployee.first_name} ${selectedEmployee.last_name}`,
              shift_date: shift.shift_date,
              shift_time: `${shift.start_time}-${shift.end_time}`
            })
          }
        }
      }
    }

    console.log(`✅ Auto-assigned ${assignedCount} shifts`)

    // Send notifications if enabled
    if (settings.notification_preferences?.notify_managers) {
      console.log('📧 Would send notification to managers')
      // Add notification logic here if needed
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `הוקצו אוטומטית ${assignedCount} משמרות`,
        assigned_count: assignedCount,
        assignments: assignments
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error in auto-scheduling:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'שגיאה פנימית בשרת. אנא נסה שוב.',
        details: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})