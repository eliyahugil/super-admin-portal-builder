import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AttendanceRecord {
  id: string;
  employee_id: string;
  business_id: string;
  branch_id: string;
  shift_date: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  actual_start_time?: string;
  actual_end_time?: string;
  break_start_time?: string;
  break_end_time?: string;
  expected_break_duration?: number;
  status: string;
  late_minutes: number;
  overtime_minutes: number;
  break_overdue_minutes: number;
}

interface NotificationSetting {
  setting_type: string;
  setting_key: string;
  is_enabled: boolean;
  threshold_value?: number;
  threshold_unit?: string;
  sound_enabled: boolean;
  mobile_enabled: boolean;
  email_enabled: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];

    console.log(`🕒 Attendance monitor running at ${now.toISOString()}`);

    // קבלת כל העסקים הפעילים
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('is_active', true);

    if (businessError) {
      throw businessError;
    }

    for (const business of businesses || []) {
      console.log(`🏢 Processing business: ${business.id}`);

      // קבלת הגדרות התראות לעסק
      const { data: notificationSettings } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('business_id', business.id)
        .eq('is_enabled', true);

      if (!notificationSettings || notificationSettings.length === 0) {
        console.log(`ℹ️  No notification settings for business ${business.id}`);
        continue;
      }

      // קבלת כל רישומי הנוכחות של היום
      const { data: attendanceRecords, error: attendanceError } = await supabase
        .from('attendance_tracking')
        .select(`
          *,
          employees!inner(id, first_name, last_name, business_id),
          branches!inner(id, name)
        `)
        .eq('employees.business_id', business.id)
        .eq('shift_date', today);

      if (attendanceError) {
        console.error(`❌ Error fetching attendance for business ${business.id}:`, attendanceError);
        continue;
      }

      // בדיקת איחורים וחריגות
      for (const record of attendanceRecords || []) {
        await checkAttendanceViolations(supabase, record, notificationSettings, now);
      }

      // בדיקת משמרות שטרם התחילו (עובדים שלא הגיעו)
      await checkMissingCheckIns(supabase, business.id, notificationSettings, now);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Attendance monitoring completed',
        timestamp: now.toISOString() 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('💥 Attendance monitor error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function checkAttendanceViolations(
  supabase: any, 
  record: any, 
  settings: NotificationSetting[], 
  now: Date
) {
  const employee = record.employees;
  const branch = record.branches;
  
  // בדיקת איחור לעבודה
  if (record.actual_start_time && record.scheduled_start_time) {
    const scheduledStart = new Date(`${record.shift_date}T${record.scheduled_start_time}`);
    const actualStart = new Date(record.actual_start_time);
    const lateMinutes = Math.max(0, Math.floor((actualStart.getTime() - scheduledStart.getTime()) / (1000 * 60)));
    
    if (lateMinutes > 0) {
      const lateSetting = settings.find(s => s.setting_type === 'attendance' && s.setting_key === 'late_arrival');
      if (lateSetting && lateMinutes >= (lateSetting.threshold_value || 15)) {
        await createNotification(supabase, {
          business_id: record.business_id,
          employee_id: record.employee_id,
          branch_id: record.branch_id,
          notification_type: 'late_arrival',
          notification_category: 'attendance',
          title: 'איחור לעבודה',
          message: `${employee.first_name} ${employee.last_name} מאחר לעבודה ב-${lateMinutes} דקות`,
          severity: lateMinutes > 30 ? 'warning' : 'info',
          metadata: {
            late_minutes: lateMinutes,
            scheduled_time: record.scheduled_start_time,
            actual_time: record.actual_start_time,
            branch_name: branch.name
          }
        });
      }
    }
  }

  // בדיקת עבודה מעבר לזמן (שעות נוספות)
  if (record.actual_start_time && record.actual_end_time) {
    const scheduledEnd = new Date(`${record.shift_date}T${record.scheduled_end_time}`);
    const actualEnd = new Date(record.actual_end_time);
    const overtimeMinutes = Math.max(0, Math.floor((actualEnd.getTime() - scheduledEnd.getTime()) / (1000 * 60)));
    
    if (overtimeMinutes > 0) {
      const overtimeSetting = settings.find(s => s.setting_type === 'overtime' && s.setting_key === 'overtime_threshold');
      if (overtimeSetting && overtimeMinutes >= (overtimeSetting.threshold_value || 30)) {
        await createNotification(supabase, {
          business_id: record.business_id,
          employee_id: record.employee_id,
          branch_id: record.branch_id,
          notification_type: 'overtime_threshold',
          notification_category: 'overtime',
          title: 'שעות נוספות',
          message: `${employee.first_name} ${employee.last_name} עובד ${overtimeMinutes} דקות נוספות`,
          severity: overtimeMinutes > 60 ? 'warning' : 'info',
          metadata: {
            overtime_minutes: overtimeMinutes,
            scheduled_end: record.scheduled_end_time,
            actual_end: record.actual_end_time,
            branch_name: branch.name
          }
        });
      }
    }
  }

  // בדיקת הפסקה מתארכת
  if (record.break_start_time && record.expected_break_duration) {
    const breakStart = new Date(record.break_start_time);
    const expectedBreakEnd = new Date(breakStart.getTime() + (record.expected_break_duration * 60000));
    
    if (now > expectedBreakEnd && record.status === 'on_break') {
      const overdueMinutes = Math.floor((now.getTime() - expectedBreakEnd.getTime()) / (1000 * 60));
      const breakSetting = settings.find(s => s.setting_type === 'break' && s.setting_key === 'long_break');
      
      if (breakSetting && overdueMinutes >= (breakSetting.threshold_value || 10)) {
        await createNotification(supabase, {
          business_id: record.business_id,
          employee_id: record.employee_id,
          branch_id: record.branch_id,
          notification_type: 'long_break',
          notification_category: 'break',
          title: 'הפסקה מתארכת',
          message: `${employee.first_name} ${employee.last_name} בהפסקה ${overdueMinutes} דקות מעבר לזמן המותר`,
          severity: overdueMinutes > 20 ? 'warning' : 'info',
          metadata: {
            overdue_minutes: overdueMinutes,
            expected_break_duration: record.expected_break_duration,
            break_start: record.break_start_time,
            branch_name: branch.name
          }
        });
      }
    }
  }
}

async function checkMissingCheckIns(
  supabase: any, 
  businessId: string, 
  settings: NotificationSetting[], 
  now: Date
) {
  const today = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().split(' ')[0];

  // קבלת משמרות שהיו אמורות להתחיל ועדיין לא התחילו
  const { data: missingSessions, error } = await supabase
    .from('attendance_tracking')
    .select(`
      *,
      employees!inner(id, first_name, last_name, business_id),
      branches!inner(id, name)
    `)
    .eq('employees.business_id', businessId)
    .eq('shift_date', today)
    .eq('status', 'scheduled')
    .lt('scheduled_start_time', currentTime);

  if (error) {
    console.error('Error checking missing check-ins:', error);
    return;
  }

  const missingSetting = settings.find(s => s.setting_type === 'attendance' && s.setting_key === 'missing_checkin');
  if (!missingSetting) return;

  for (const session of missingSessions || []) {
    const scheduledStart = new Date(`${session.shift_date}T${session.scheduled_start_time}`);
    const missedMinutes = Math.floor((now.getTime() - scheduledStart.getTime()) / (1000 * 60));
    
    if (missedMinutes >= (missingSetting.threshold_value || 15)) {
      await createNotification(supabase, {
        business_id: session.business_id,
        employee_id: session.employee_id,
        branch_id: session.branch_id,
        notification_type: 'missing_checkin',
        notification_category: 'attendance',
        title: 'חסרת כניסה למערכת',
        message: `${session.employees.first_name} ${session.employees.last_name} לא ביצע כניסה למערכת (${missedMinutes} דקות אחרי זמן התחלת המשמרת)`,
        severity: missedMinutes > 30 ? 'error' : 'warning',
        requires_action: true,
        metadata: {
          missed_minutes: missedMinutes,
          scheduled_start: session.scheduled_start_time,
          branch_name: session.branches.name
        }
      });
    }
  }
}

async function createNotification(supabase: any, notificationData: any) {
  try {
    // קבלת כל המנהלים של העסק
    const { data: managers, error: managersError } = await supabase
      .from('profiles')
      .select('id')
      .or(`business_id.eq.${notificationData.business_id},role.eq.super_admin`);

    if (managersError) {
      console.error('Error fetching managers:', managersError);
      return;
    }

    // יצירת התראה לכל מנהל
    for (const manager of managers || []) {
      const { error: notificationError } = await supabase
        .from('advanced_notifications')
        .insert({
          ...notificationData,
          user_id: manager.id
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      } else {
        console.log(`✅ Notification created for manager ${manager.id}: ${notificationData.title}`);
      }
    }
  } catch (error) {
    console.error('Error in createNotification:', error);
  }
}