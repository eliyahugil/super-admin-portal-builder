-- Step 1: Clean up duplicate active tokens by keeping only the newest one for each employee
WITH ranked_tokens AS (
  SELECT 
    id,
    employee_id,
    business_id,
    is_active,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY 
        COALESCE(employee_id::text, 'NULL'), 
        business_id,
        CASE WHEN is_active THEN 'active' ELSE 'inactive' END
      ORDER BY created_at DESC
    ) as rn
  FROM public.shift_submission_tokens
  WHERE is_active = true
)
UPDATE public.shift_submission_tokens 
SET is_active = false 
WHERE id IN (
  SELECT id FROM ranked_tokens WHERE rn > 1
);

-- Step 2: Now create function to handle new tokens (deactivate old ones)
CREATE OR REPLACE FUNCTION ensure_single_active_token()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check if the new token is active
  IF NEW.is_active = true THEN
    -- Deactivate existing active tokens for this employee/business combination
    IF NEW.employee_id IS NOT NULL THEN
      -- Employee-specific token: deactivate other active tokens for this employee
      UPDATE public.shift_submission_tokens 
      SET is_active = false 
      WHERE employee_id = NEW.employee_id 
      AND business_id = NEW.business_id 
      AND is_active = true 
      AND id != NEW.id;
    ELSE
      -- Business-wide token: deactivate other active business-wide tokens
      UPDATE public.shift_submission_tokens 
      SET is_active = false 
      WHERE employee_id IS NULL 
      AND business_id = NEW.business_id 
      AND is_active = true 
      AND id != NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create trigger for new token insertions
DROP TRIGGER IF EXISTS trigger_ensure_single_active_token ON public.shift_submission_tokens;
CREATE TRIGGER trigger_ensure_single_active_token
  BEFORE INSERT ON public.shift_submission_tokens
  FOR EACH ROW EXECUTE FUNCTION ensure_single_active_token();

-- Step 4: Create function to automatically deactivate token after submission
CREATE OR REPLACE FUNCTION deactivate_token_after_submission()
RETURNS TRIGGER AS $$
DECLARE
  max_subs INTEGER;
  current_subs INTEGER;
BEGIN
  -- Get the token's max_submissions and current count
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger to deactivate token after submission
DROP TRIGGER IF EXISTS trigger_deactivate_token_after_submission ON public.public_shift_submissions;
CREATE TRIGGER trigger_deactivate_token_after_submission
  AFTER INSERT ON public.public_shift_submissions
  FOR EACH ROW EXECUTE FUNCTION deactivate_token_after_submission();