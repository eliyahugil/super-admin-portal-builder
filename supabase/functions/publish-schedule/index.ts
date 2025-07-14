import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PublishScheduleRequest {
  weekStart: string;
  weekEnd: string;
  shiftIds: string[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { weekStart, weekEnd, shiftIds }: PublishScheduleRequest = await req.json();

    console.log(`Publishing schedule for week ${weekStart} to ${weekEnd}, ${shiftIds.length} shifts`);

    // Step 1: Update all specified shifts to approved status
    const { error: updateError } = await supabaseClient
      .from('scheduled_shifts')
      .update({ 
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .in('id', shiftIds);

    if (updateError) {
      console.error('Error updating shifts:', updateError);
      throw updateError;
    }

    // Step 2: Get employee details for the shifts
    const { data: shiftsWithEmployees, error: fetchError } = await supabaseClient
      .from('scheduled_shifts')
      .select(`
        id,
        shift_date,
        start_time,
        end_time,
        employees:employee_id (
          id,
          first_name,
          last_name,
          phone
        ),
        branches:branch_id (
          name
        )
      `)
      .in('id', shiftIds);

    if (fetchError) {
      console.error('Error fetching shift details:', fetchError);
      throw fetchError;
    }

    if (!shiftsWithEmployees) {
      throw new Error('No shifts found');
    }

    // Step 3: Group shifts by employee and prepare notifications
    const employeeShifts: Record<string, any> = {};
    
    shiftsWithEmployees.forEach(shift => {
      if (shift.employees?.id) {
        const employeeId = shift.employees.id;
        if (!employeeShifts[employeeId]) {
          employeeShifts[employeeId] = {
            employee: shift.employees,
            shifts: []
          };
        }
        employeeShifts[employeeId].shifts.push({
          date: shift.shift_date,
          startTime: shift.start_time,
          endTime: shift.end_time,
          branch: shift.branches?.name || 'ללא סניף'
        });
      }
    });

    // Step 4: Send WhatsApp notifications to employees
    const notificationPromises = Object.values(employeeShifts).map(async (employeeData: any) => {
      const employee = employeeData.employee;
      const shifts = employeeData.shifts;
      
      if (!employee.phone) {
        console.log(`No phone number for employee ${employee.first_name} ${employee.last_name}`);
        return false;
      }

      // Format shifts list for the message
      const shiftsText = shifts
        .map((shift: any) => {
          const date = new Date(shift.date).toLocaleDateString('he-IL');
          return `📅 ${date} | ⏰ ${shift.startTime}-${shift.endTime} | 📍 ${shift.branch}`;
        })
        .join('\n');

      const message = `🎉 *הסידור פורסם!*

שלום ${employee.first_name},

הסידור החדש פורסם ומוכן לצפייה.

*המשמרות שלך השבוע:*
${shiftsText}

ניתן לצפות בפרטים המלאים באפליקציה.

בהצלחה! 💪`;

      try {
        // Send WhatsApp message using existing send-whatsapp-message function
        const { error: whatsappError } = await supabaseClient.functions.invoke('send-whatsapp-message', {
          body: {
            to: employee.phone,
            message: message
          }
        });

        if (whatsappError) {
          console.error(`Error sending WhatsApp to ${employee.phone}:`, whatsappError);
          return false;
        }

        console.log(`WhatsApp sent successfully to ${employee.first_name} ${employee.last_name}`);
        return true;
      } catch (error) {
        console.error(`Error sending WhatsApp to ${employee.phone}:`, error);
        return false;
      }
    });

    // Wait for all notifications to complete
    const results = await Promise.all(notificationPromises);
    const successCount = results.filter(Boolean).length;
    const totalCount = Object.keys(employeeShifts).length;

    console.log(`Schedule published successfully. Notifications sent: ${successCount}/${totalCount}`);

    // Step 5: Log the publication action
    const { error: logError } = await supabaseClient
      .from('activity_logs')
      .insert({
        action: 'schedule_published',
        target_type: 'schedule',
        target_id: `${weekStart}_to_${weekEnd}`,
        details: {
          shifts_count: shiftIds.length,
          employees_notified: successCount,
          week_start: weekStart,
          week_end: weekEnd
        },
        user_id: req.headers.get('user-id') || 'system'
      });

    if (logError) {
      console.error('Error logging publication:', logError);
      // Don't throw here as the main operation succeeded
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Schedule published successfully',
        shiftsApproved: shiftIds.length,
        employeeCount: totalCount,
        notificationsSent: successCount
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in publish-schedule function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);