-- יצירת טבלת הגדרות התראות למנהלים
CREATE TABLE notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  setting_type TEXT NOT NULL,
  setting_key TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  threshold_value INTEGER,
  threshold_unit TEXT, -- 'minutes', 'hours', 'days'
  sound_enabled BOOLEAN NOT NULL DEFAULT true,
  mobile_enabled BOOLEAN NOT NULL DEFAULT true,
  email_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, user_id, setting_type, setting_key)
);

-- יצירת טבלת התראות מתקדמת
CREATE TABLE advanced_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  notification_type TEXT NOT NULL,
  notification_category TEXT NOT NULL, -- 'attendance', 'shift', 'break', 'overtime', 'system'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'error', 'critical'
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID,
  metadata JSONB DEFAULT '{}',
  requires_action BOOLEAN NOT NULL DEFAULT false,
  action_deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- יצירת טבלת לוג פעולות אוף-ליין
CREATE TABLE offline_actions_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  action_data JSONB NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  synced_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'synced', 'failed'
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- יצירת טבלת מעקב זמני נוכחות
CREATE TABLE attendance_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  scheduled_start_time TIME NOT NULL,
  scheduled_end_time TIME NOT NULL,
  actual_start_time TIMESTAMP WITH TIME ZONE,
  actual_end_time TIMESTAMP WITH TIME ZONE,
  break_start_time TIMESTAMP WITH TIME ZONE,
  break_end_time TIMESTAMP WITH TIME ZONE,
  expected_break_duration INTEGER, -- minutes
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'started', 'on_break', 'ended', 'overtime', 'absent'
  late_minutes INTEGER DEFAULT 0,
  overtime_minutes INTEGER DEFAULT 0,
  break_overdue_minutes INTEGER DEFAULT 0,
  is_offline_sync BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- אינדקסים לביצועים
CREATE INDEX idx_notification_settings_business_user ON notification_settings(business_id, user_id);
CREATE INDEX idx_advanced_notifications_business_unread ON advanced_notifications(business_id, is_read, created_at DESC);
CREATE INDEX idx_advanced_notifications_category ON advanced_notifications(business_id, notification_category, created_at DESC);
CREATE INDEX idx_offline_actions_sync_status ON offline_actions_log(business_id, sync_status, attempted_at);
CREATE INDEX idx_attendance_tracking_business_date ON attendance_tracking(business_id, shift_date, status);

-- RLS Policies
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE advanced_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_actions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_tracking ENABLE ROW LEVEL SECURITY;

-- Policies עבור notification_settings
CREATE POLICY "Users can manage their own notification settings" 
ON notification_settings 
FOR ALL 
USING (business_id = ANY(get_user_business_ids()) AND user_id = auth.uid())
WITH CHECK (business_id = ANY(get_user_business_ids()) AND user_id = auth.uid());

-- Policies עבור advanced_notifications
CREATE POLICY "Business users can view their business notifications" 
ON advanced_notifications 
FOR SELECT 
USING (business_id = ANY(get_user_business_ids()));

CREATE POLICY "System can insert notifications" 
ON advanced_notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their notifications" 
ON advanced_notifications 
FOR UPDATE 
USING (business_id = ANY(get_user_business_ids()) AND user_id = auth.uid())
WITH CHECK (business_id = ANY(get_user_business_ids()) AND user_id = auth.uid());

-- Policies עבור offline_actions_log
CREATE POLICY "Users can manage their offline actions" 
ON offline_actions_log 
FOR ALL 
USING (business_id = ANY(get_user_business_ids()) AND user_id = auth.uid())
WITH CHECK (business_id = ANY(get_user_business_ids()) AND user_id = auth.uid());

-- Policies עבור attendance_tracking
CREATE POLICY "Business users can manage attendance tracking" 
ON attendance_tracking 
FOR ALL 
USING (business_id = ANY(get_user_business_ids()))
WITH CHECK (business_id = ANY(get_user_business_ids()));

-- טריגרים לעדכון זמן
CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advanced_notifications_updated_at
  BEFORE UPDATE ON advanced_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_tracking_updated_at
  BEFORE UPDATE ON attendance_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- פונקציה ליצירת התראה מתקדמת (עם פרמטרים אופציונליים בסוף)
CREATE OR REPLACE FUNCTION create_advanced_notification(
  p_business_id UUID,
  p_user_id UUID,
  p_notification_type TEXT,
  p_notification_category TEXT,
  p_title TEXT,
  p_message TEXT,
  p_employee_id UUID DEFAULT NULL,
  p_branch_id UUID DEFAULT NULL,
  p_severity TEXT DEFAULT 'info',
  p_requires_action BOOLEAN DEFAULT false,
  p_action_deadline TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO advanced_notifications (
    business_id,
    user_id,
    employee_id,
    branch_id,
    notification_type,
    notification_category,
    title,
    message,
    severity,
    requires_action,
    action_deadline,
    metadata
  ) VALUES (
    p_business_id,
    p_user_id,
    p_employee_id,
    p_branch_id,
    p_notification_type,
    p_notification_category,
    p_title,
    p_message,
    p_severity,
    p_requires_action,
    p_action_deadline,
    p_metadata
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;