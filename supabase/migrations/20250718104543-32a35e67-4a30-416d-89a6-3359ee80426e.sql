-- Fix RLS policies to allow public access to shift submission tokens
-- This is needed for public shift submission pages

-- Allow public access to read shift submission tokens when they are active and valid
CREATE POLICY "Public access to active shift submission tokens"
ON public.shift_submission_tokens
FOR SELECT
USING (
  is_active = true 
  AND expires_at > now()
);

-- The edge function also needs to be able to update the tokens for usage tracking
-- Create a service role policy for this
CREATE POLICY "Service role can update shift submission tokens"
ON public.shift_submission_tokens
FOR UPDATE
USING (true)
WITH CHECK (true);