
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  business_id: string;
}

interface BusinessSettings {
  id: string;
  business_id: string;
  auto_shift_reminders: boolean;
  reminder_day: string;
  reminder_hour: number;
}

interface ShiftSubmission {
  employee_id: string;
  submitted_at: string | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting automated shift reminder process...');

    // Get current day and hour
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentHour = now.getHours();

    console.log(`Current time: ${currentDay} ${currentHour}:00`);

    // Get all businesses with auto reminders enabled for current day/hour
    const { data: businessSettings, error: settingsError } = await supabase
      .from('business_settings')
      .select('*')
      .eq('auto_shift_reminders', true)
      .eq('reminder_day', currentDay)
      .eq('reminder_hour', currentHour);

    if (settingsError) {
      console.error('Error fetching business settings:', settingsError);
      throw settingsError;
    }

    if (!businessSettings || businessSettings.length === 0) {
      console.log('No businesses found with auto reminders enabled for current time');
      return new Response(
        JSON.stringify({ message: 'No reminders to send at this time' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${businessSettings.length} businesses with auto reminders enabled`);

    let totalSent = 0;
    let totalFailed = 0;

    for (const settings of businessSettings as BusinessSettings[]) {
      console.log(`Processing business: ${settings.business_id}`);

      // Get current week's start and end dates
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      // Get all employees for this business
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('id, first_name, last_name, phone, business_id')
        .eq('business_id', settings.business_id)
        .eq('is_active', true)
        .not('phone', 'is', null);

      if (employeesError) {
        console.error('Error fetching employees:', employeesError);
        continue;
      }

      if (!employees || employees.length === 0) {
        console.log(`No active employees with phone numbers found for business ${settings.business_id}`);
        continue;
      }

      // Get shift submissions for current week
      const { data: submissions, error: submissionsError } = await supabase
        .from('shift_submissions')
        .select('employee_id, submitted_at')
        .gte('week_start_date', startOfWeek.toISOString().split('T')[0])
        .lte('week_end_date', endOfWeek.toISOString().split('T')[0]);

      if (submissionsError) {
        console.error('Error fetching shift submissions:', submissionsError);
        continue;
      }

      // Find employees who haven't submitted shifts
      const submittedEmployeeIds = new Set(
        (submissions as ShiftSubmission[])?.map(s => s.employee_id) || []
      );

      const unsubmittedEmployees = (employees as Employee[]).filter(
        emp => !submittedEmployeeIds.has(emp.id)
      );

      console.log(`Found ${unsubmittedEmployees.length} employees who haven't submitted shifts`);

      // Send reminders to unsubmitted employees
      for (const employee of unsubmittedEmployees) {
        try {
          const reminderMessage = `היי ${employee.first_name}! 👋\n\nתזכורת להגשת משמרות לשבוע הקרוב.\n\nאנא הגישו עד סוף היום.\n\nתודה! 🙏`;
          
          // Clean phone number
          const cleanPhone = employee.phone.replace(/[^\d]/g, '');
          const whatsappPhone = cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : cleanPhone;
          
          // Log the reminder attempt
          const { error: logError } = await supabase
            .from('shift_reminder_logs')
            .insert({
              employee_id: employee.id,
              business_id: employee.business_id,
              method: 'auto',
              status: 'success',
              message_content: reminderMessage,
              phone_number: whatsappPhone,
            });

          if (logError) {
            console.error('Error logging reminder:', logError);
          }

          totalSent++;
          console.log(`Reminder logged for employee ${employee.first_name} ${employee.last_name}`);

        } catch (error) {
          console.error(`Failed to send reminder to ${employee.first_name} ${employee.last_name}:`, error);
          
          // Log the failed attempt
          await supabase
            .from('shift_reminder_logs')
            .insert({
              employee_id: employee.id,
              business_id: employee.business_id,
              method: 'auto',
              status: 'failed',
              message_content: `Failed to send reminder to ${employee.first_name}`,
              phone_number: employee.phone,
              error_details: error instanceof Error ? error.message : String(error),
            });

          totalFailed++;
        }
      }
    }

    const result = {
      message: 'Shift reminders processing completed',
      totalSent,
      totalFailed,
      timestamp: now.toISOString(),
    };

    console.log('Reminder process completed:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in send-shift-reminders function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
