import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string;
          business_id: string;
          first_name: string;
          last_name: string;
          birth_date: string | null;
          is_active: boolean;
        };
      };
      birthday_notifications: {
        Row: {
          id: string;
          employee_id: string;
          notification_date: string;
          sent_at: string;
          message: string;
          created_at: string;
        };
        Insert: {
          employee_id: string;
          notification_date: string;
          message: string;
        };
      };
      employee_notifications: {
        Row: {
          id: string;
          employee_id: string;
          title: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          employee_id: string;
          title: string;
          message: string;
          sent_by?: string;
        };
      };
    };
  };
}

const supabase = createClient<Database>(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const handler = async (req: Request): Promise<Response> => {
  console.log('🎂 Birthday notifications function started');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const todayFormatted = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}`; // DD-MM

    console.log(`🗓️ Checking for birthdays on: ${todayString} (${todayFormatted})`);

    // Find employees with birthdays today
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('id, business_id, first_name, last_name, birth_date')
      .eq('is_active', true)
      .not('birth_date', 'is', null);

    if (employeesError) {
      console.error('❌ Error fetching employees:', employeesError);
      throw employeesError;
    }

    console.log(`📋 Found ${employees?.length || 0} active employees with birth dates`);

    if (!employees || employees.length === 0) {
      console.log('ℹ️ No employees found with birth dates');
      return new Response(
        JSON.stringify({ success: true, message: 'No employees with birth dates found' }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Filter employees with birthdays today
    const birthdayEmployees = employees.filter(employee => {
      if (!employee.birth_date) return false;
      
      const birthDate = new Date(employee.birth_date);
      const birthFormatted = `${String(birthDate.getDate()).padStart(2, '0')}-${String(birthDate.getMonth() + 1).padStart(2, '0')}`;
      
      return birthFormatted === todayFormatted;
    });

    console.log(`🎉 Found ${birthdayEmployees.length} employees with birthdays today`);

    if (birthdayEmployees.length === 0) {
      console.log('ℹ️ No birthdays today');
      return new Response(
        JSON.stringify({ success: true, message: 'No birthdays today' }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Check which employees haven't received birthday notifications today
    const { data: existingNotifications, error: notificationsError } = await supabase
      .from('birthday_notifications')
      .select('employee_id')
      .eq('notification_date', todayString);

    if (notificationsError) {
      console.error('❌ Error checking existing notifications:', notificationsError);
      throw notificationsError;
    }

    const alreadyNotifiedIds = new Set(existingNotifications?.map(n => n.employee_id) || []);
    const employeesToNotify = birthdayEmployees.filter(emp => !alreadyNotifiedIds.has(emp.id));

    console.log(`📧 Need to send notifications to ${employeesToNotify.length} employees`);

    let successCount = 0;
    let errorCount = 0;

    for (const employee of employeesToNotify) {
      try {
        const birthdayMessage = `🎉 מזל טוב ${employee.first_name} ${employee.last_name}! היום יום הולדתך! 🎂 
מאחלים לך יום מלא שמחה והצלחה בכל הדרכים! 
כל הצוות שלנו מברך אותך ביום המיוחד הזה. 💫`;

        // Send notification to employee
        const { error: notificationError } = await supabase
          .from('employee_notifications')
          .insert({
            employee_id: employee.id,
            title: '🎂 יום הולדת שמח!',
            message: birthdayMessage,
            sent_by: null // System message
          });

        if (notificationError) {
          console.error(`❌ Failed to send notification to ${employee.first_name} ${employee.last_name}:`, notificationError);
          errorCount++;
          continue;
        }

        // Record birthday notification
        const { error: recordError } = await supabase
          .from('birthday_notifications')
          .insert({
            employee_id: employee.id,
            notification_date: todayString,
            message: birthdayMessage
          });

        if (recordError) {
          console.error(`❌ Failed to record birthday notification for ${employee.first_name} ${employee.last_name}:`, recordError);
          errorCount++;
          continue;
        }

        console.log(`✅ Birthday notification sent to ${employee.first_name} ${employee.last_name}`);
        successCount++;

      } catch (error) {
        console.error(`❌ Error processing birthday for ${employee.first_name} ${employee.last_name}:`, error);
        errorCount++;
      }
    }

    const result = {
      success: true,
      date: todayString,
      totalBirthdays: birthdayEmployees.length,
      notificationsSent: successCount,
      errors: errorCount,
      alreadyNotified: alreadyNotifiedIds.size,
      employees: birthdayEmployees.map(emp => `${emp.first_name} ${emp.last_name}`)
    };

    console.log('🎂 Birthday notifications completed:', result);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('❌ Error in birthday notifications function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
};

serve(handler);