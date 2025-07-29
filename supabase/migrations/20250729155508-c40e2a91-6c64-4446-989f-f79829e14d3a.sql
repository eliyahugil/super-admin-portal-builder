-- Allow service role to insert activity logs
CREATE POLICY "Service role can insert activity logs" 
ON public.activity_logs 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Allow service role to insert advanced notifications
CREATE POLICY "Service role can insert advanced notifications" 
ON public.advanced_notifications 
FOR INSERT 
TO service_role
WITH CHECK (true);