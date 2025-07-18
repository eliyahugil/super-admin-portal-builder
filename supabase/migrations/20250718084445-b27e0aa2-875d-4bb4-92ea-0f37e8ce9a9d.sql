-- Add RLS policy to allow public access to available_shifts via valid tokens
CREATE POLICY "Public access to available_shifts via valid tokens" 
ON public.available_shifts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.shift_submission_tokens sst
    WHERE sst.business_id = available_shifts.business_id
      AND sst.is_active = true
      AND sst.expires_at > now()
      AND sst.week_start_date = available_shifts.week_start_date
      AND sst.week_end_date = available_shifts.week_end_date
  )
);