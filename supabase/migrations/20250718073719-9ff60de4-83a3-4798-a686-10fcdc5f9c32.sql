-- Create a function to automatically send birthday notifications
-- This function will be called daily via cron job
CREATE OR REPLACE FUNCTION schedule_birthday_notifications()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Make an HTTP request to the birthday notifications edge function
  PERFORM net.http_post(
    url := 'https://xmhmztipuvzmwgbcovch.supabase.co/functions/v1/send-birthday-notifications',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtaG16dGlwdXZ6bXdnYmNvdmNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTEyOTM4MiwiZXhwIjoyMDY0NzA1MzgyfQ.GKK-gqDJRLyWzHYEfHrnbPa2Xol8pV5kHxRwhcNrGjw"}'::jsonb,
    body := '{}'::jsonb
  );
  
  RETURN 'Birthday notifications scheduled successfully';
END;
$$;

-- Schedule the function to run daily at 9:00 AM
SELECT cron.schedule(
  'daily-birthday-notifications',
  '0 9 * * *', -- Every day at 9:00 AM
  'SELECT schedule_birthday_notifications();'
);