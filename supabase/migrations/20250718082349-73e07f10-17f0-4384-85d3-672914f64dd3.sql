-- First, let's deactivate duplicate tokens, keeping only the newest one for each employee/business combination
WITH duplicates AS (
  SELECT 
    id,
    employee_id,
    business_id,
    is_active,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY employee_id, business_id, is_active 
      ORDER BY created_at DESC
    ) as rn
  FROM public.shift_submission_tokens
  WHERE is_active = true AND employee_id IS NOT NULL
)
UPDATE public.shift_submission_tokens 
SET is_active = false 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Also handle business-wide tokens (where employee_id is NULL)
WITH business_duplicates AS (
  SELECT 
    id,
    business_id,
    is_active,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY business_id, is_active 
      ORDER BY created_at DESC
    ) as rn
  FROM public.shift_submission_tokens
  WHERE is_active = true AND employee_id IS NULL
)
UPDATE public.shift_submission_tokens 
SET is_active = false 
WHERE id IN (
  SELECT id FROM business_duplicates WHERE rn > 1
);

-- Now add the constraints
ALTER TABLE public.shift_submission_tokens
ADD CONSTRAINT unique_active_employee_token
UNIQUE (employee_id, business_id, is_active) 
DEFERRABLE INITIALLY DEFERRED;

-- Add check to prevent creating multiple active tokens for same business when employee_id is NULL
CREATE UNIQUE INDEX unique_active_business_token 
ON public.shift_submission_tokens (business_id, is_active) 
WHERE employee_id IS NULL AND is_active = true;

-- Create function to automatically deactivate token after submission
CREATE OR REPLACE FUNCTION deactivate_token_after_submission()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the token's max_submissions
  DECLARE
    max_subs INTEGER;
    current_subs INTEGER;
  BEGIN
    SELECT max_submissions, current_submissions 
    INTO max_subs, current_subs
    FROM public.shift_submission_tokens 
    WHERE id = NEW.token_id;
    
    -- If we've reached max submissions, deactivate the token
    IF current_subs >= max_subs THEN
      UPDATE public.shift_submission_tokens 
      SET is_active = false 
      WHERE id = NEW.token_id;
    END IF;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to deactivate token after submission
DROP TRIGGER IF EXISTS trigger_deactivate_token_after_submission ON public.public_shift_submissions;
CREATE TRIGGER trigger_deactivate_token_after_submission
  AFTER INSERT ON public.public_shift_submissions
  FOR EACH ROW EXECUTE FUNCTION deactivate_token_after_submission();