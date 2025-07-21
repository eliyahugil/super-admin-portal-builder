-- Add approval system to employee_files table
ALTER TABLE public.employee_files 
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS rejection_reason text,
ADD COLUMN IF NOT EXISTS extracted_data jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_auto_extracted boolean DEFAULT false;

-- Create file approval notifications table
CREATE TABLE IF NOT EXISTS public.file_approval_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id uuid NOT NULL REFERENCES public.employee_files(id) ON DELETE CASCADE,
  manager_id uuid NOT NULL REFERENCES auth.users(id),
  business_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  notification_type text NOT NULL DEFAULT 'file_uploaded' CHECK (notification_type IN ('file_uploaded', 'file_approved', 'file_rejected')),
  is_read boolean DEFAULT false,
  message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  read_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.file_approval_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for file approval notifications
CREATE POLICY "Managers can view notifications for their business" 
ON public.file_approval_notifications 
FOR SELECT 
USING (
  business_id IN (
    SELECT b.id
    FROM businesses b
    WHERE b.owner_id = auth.uid()
  ) OR
  business_id IN (
    SELECT p.business_id
    FROM profiles p
    WHERE p.id = auth.uid() AND p.business_id IS NOT NULL
  ) OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

CREATE POLICY "System can insert file approval notifications" 
ON public.file_approval_notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Managers can update notifications for their business" 
ON public.file_approval_notifications 
FOR UPDATE 
USING (
  business_id IN (
    SELECT b.id
    FROM businesses b
    WHERE b.owner_id = auth.uid()
  ) OR
  business_id IN (
    SELECT p.business_id
    FROM profiles p
    WHERE p.id = auth.uid() AND p.business_id IS NOT NULL
  ) OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Create function to notify managers when file is uploaded
CREATE OR REPLACE FUNCTION public.notify_managers_on_file_upload()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  manager_record RECORD;
  employee_name TEXT;
BEGIN
  -- Get employee name for notification
  SELECT first_name || ' ' || last_name INTO employee_name
  FROM employees 
  WHERE id = NEW.employee_id;
  
  -- Insert notifications for all managers of this business
  FOR manager_record IN 
    SELECT DISTINCT p.id as manager_id
    FROM profiles p
    JOIN businesses b ON b.owner_id = p.id
    WHERE b.id = NEW.business_id
    UNION
    SELECT DISTINCT p.id as manager_id
    FROM profiles p
    WHERE p.business_id = NEW.business_id AND p.role IN ('business_admin', 'super_admin')
  LOOP
    INSERT INTO public.file_approval_notifications (
      file_id,
      manager_id,
      business_id,
      employee_id,
      notification_type,
      message
    ) VALUES (
      NEW.id,
      manager_record.manager_id,
      NEW.business_id,
      NEW.employee_id,
      'file_uploaded',
      'העובד ' || COALESCE(employee_name, 'לא ידוע') || ' העלה קובץ חדש לתיק האישי שלו: ' || NEW.file_name
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger for file upload notifications
CREATE TRIGGER trigger_notify_managers_on_file_upload
  AFTER INSERT ON public.employee_files
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_managers_on_file_upload();

-- Create function to update approval status
CREATE OR REPLACE FUNCTION public.approve_employee_file(
  file_id_param uuid,
  approval_status_param text,
  rejection_reason_param text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  file_record RECORD;
  employee_name TEXT;
  notification_message TEXT;
BEGIN
  -- Get file and employee info
  SELECT ef.*, e.first_name || ' ' || e.last_name as emp_name
  INTO file_record
  FROM employee_files ef
  JOIN employees e ON e.id = ef.employee_id
  WHERE ef.id = file_id_param;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update file approval status
  UPDATE employee_files 
  SET 
    approval_status = approval_status_param,
    approved_by = auth.uid(),
    approved_at = now(),
    rejection_reason = rejection_reason_param
  WHERE id = file_id_param;
  
  -- Create notification message
  IF approval_status_param = 'approved' THEN
    notification_message := 'הקובץ ' || file_record.file_name || ' אושר על ידי המנהל';
  ELSE
    notification_message := 'הקובץ ' || file_record.file_name || ' נדחה על ידי המנהל';
    IF rejection_reason_param IS NOT NULL THEN
      notification_message := notification_message || '. סיבה: ' || rejection_reason_param;
    END IF;
  END IF;
  
  -- Insert notification
  INSERT INTO public.file_approval_notifications (
    file_id,
    manager_id,
    business_id,
    employee_id,
    notification_type,
    message
  ) VALUES (
    file_id_param,
    auth.uid(),
    file_record.business_id,
    file_record.employee_id,
    CASE WHEN approval_status_param = 'approved' THEN 'file_approved' ELSE 'file_rejected' END,
    notification_message
  );
  
  RETURN TRUE;
END;
$$;