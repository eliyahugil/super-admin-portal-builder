-- Create unique index only for active tokens for employees
CREATE UNIQUE INDEX unique_active_employee_tokens 
ON public.shift_submission_tokens (employee_id, business_id) 
WHERE is_active = true AND employee_id IS NOT NULL;

-- Create unique index only for active business-wide tokens
CREATE UNIQUE INDEX unique_active_business_tokens 
ON public.shift_submission_tokens (business_id) 
WHERE is_active = true AND employee_id IS NULL;

-- Create function to check for existing active tokens before creating new ones
CREATE OR REPLACE FUNCTION check_active_token_before_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if there's already an active token for this employee/business
  IF NEW.is_active = true THEN
    IF NEW.employee_id IS NOT NULL THEN
      -- Check for employee-specific token
      IF EXISTS (
        SELECT 1 FROM public.shift_submission_tokens 
        WHERE employee_id = NEW.employee_id 
        AND business_id = NEW.business_id 
        AND is_active = true 
        AND id != NEW.id
      ) THEN
        -- Deactivate existing token
        UPDATE public.shift_submission_tokens 
        SET is_active = false 
        WHERE employee_id = NEW.employee_id 
        AND business_id = NEW.business_id 
        AND is_active = true 
        AND id != NEW.id;
      END IF;
    ELSE
      -- Check for business-wide token
      IF EXISTS (
        SELECT 1 FROM public.shift_submission_tokens 
        WHERE employee_id IS NULL 
        AND business_id = NEW.business_id 
        AND is_active = true 
        AND id != NEW.id
      ) THEN
        -- Deactivate existing token
        UPDATE public.shift_submission_tokens 
        SET is_active = false 
        WHERE employee_id IS NULL 
        AND business_id = NEW.business_id 
        AND is_active = true 
        AND id != NEW.id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check before insert
CREATE TRIGGER trigger_check_active_token_before_insert
  BEFORE INSERT ON public.shift_submission_tokens
  FOR EACH ROW EXECUTE FUNCTION check_active_token_before_insert();

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