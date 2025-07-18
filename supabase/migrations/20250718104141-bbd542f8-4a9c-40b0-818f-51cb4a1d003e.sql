-- Fix RLS policy for shift_submissions to allow edge function inserts
-- Drop the overly restrictive insert policy
DROP POLICY IF EXISTS "System can insert shift submissions" ON public.shift_submissions;

-- Create a more permissive policy that allows edge functions to insert data
CREATE POLICY "Allow edge function inserts"
ON public.shift_submissions
FOR INSERT
WITH CHECK (true);

-- Also allow public access for token-based submissions
CREATE POLICY "Public token submissions allowed"
ON public.shift_submissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.shift_submission_tokens sst
    WHERE sst.employee_id = shift_submissions.employee_id
    AND sst.is_active = true
    AND sst.expires_at > now()
  )
);