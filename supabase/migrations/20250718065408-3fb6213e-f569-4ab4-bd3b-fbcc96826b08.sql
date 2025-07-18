-- Add RLS policies for shift_submission_tokens table

-- Users can create tokens for their businesses
CREATE POLICY "Users can create tokens for their businesses" 
ON public.shift_submission_tokens 
FOR INSERT 
WITH CHECK (
  business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Users can view tokens for their businesses  
CREATE POLICY "Users can view tokens for their businesses"
ON public.shift_submission_tokens
FOR SELECT
USING (
  business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Users can update tokens for their businesses
CREATE POLICY "Users can update tokens for their businesses"
ON public.shift_submission_tokens
FOR UPDATE
USING (
  business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Users can delete tokens for their businesses  
CREATE POLICY "Users can delete tokens for their businesses"
ON public.shift_submission_tokens
FOR DELETE
USING (
  business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Also add policies for public_shift_submissions table
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

-- Users can view submissions for their business tokens
CREATE POLICY "Users can view submissions for their business tokens"
ON public.public_shift_submissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM shift_submission_tokens sst
    JOIN businesses b ON b.id = sst.business_id
    WHERE sst.id = token_id
    AND (b.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'))
  )
);

-- Allow updating submission status by business owners
CREATE POLICY "Users can update submissions for their business tokens"
ON public.public_shift_submissions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM shift_submission_tokens sst
    JOIN businesses b ON b.id = sst.business_id
    WHERE sst.id = token_id
    AND (b.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'))
  )
);