-- Add missing RLS policies for shift_submission_tokens table

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create tokens for their businesses" ON public.shift_submission_tokens;
DROP POLICY IF EXISTS "Users can view tokens for their businesses" ON public.shift_submission_tokens;
DROP POLICY IF EXISTS "Users can update tokens for their businesses" ON public.shift_submission_tokens;
DROP POLICY IF EXISTS "Users can delete tokens for their businesses" ON public.shift_submission_tokens;

-- Create new policies for shift_submission_tokens
CREATE POLICY "Users can create tokens for their businesses" 
ON public.shift_submission_tokens 
FOR INSERT 
WITH CHECK (
  business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "Users can view tokens for their businesses"
ON public.shift_submission_tokens
FOR SELECT
USING (
  business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "Users can update tokens for their businesses"
ON public.shift_submission_tokens
FOR UPDATE
USING (
  business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "Users can delete tokens for their businesses"
ON public.shift_submission_tokens
FOR DELETE
USING (
  business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Add missing policy for public token creation
DROP POLICY IF EXISTS "Anyone can create submissions with valid token" ON public.public_shift_submissions;

CREATE POLICY "Anyone can create submissions with valid token"
ON public.public_shift_submissions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM shift_submission_tokens 
    WHERE id = token_id 
    AND is_active = true 
    AND expires_at > now()
    AND current_submissions < max_submissions
  )
);