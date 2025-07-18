-- Remove existing conflicting policies
DROP POLICY IF EXISTS "Anyone can create submissions with valid token" ON public.public_shift_submissions;
DROP POLICY IF EXISTS "Anyone can submit shifts with valid token" ON public.public_shift_submissions;

-- Create a single, simple policy for public submissions
CREATE POLICY "Public can submit with valid token"
ON public.public_shift_submissions
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.shift_submission_tokens sst
    WHERE sst.id = public_shift_submissions.token_id
      AND sst.is_active = true
      AND sst.expires_at > now()
      AND (sst.max_submissions IS NULL OR sst.current_submissions < sst.max_submissions)
  )
);