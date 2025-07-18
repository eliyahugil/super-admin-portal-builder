-- Add constraint to prevent overlapping tokens for same employee
ALTER TABLE public.shift_submission_tokens
ADD CONSTRAINT unique_employee_date_range
EXCLUDE USING gist (
    employee_id WITH =,
    daterange(week_start_date, week_end_date, '[]') WITH &&
) WHERE (employee_id IS NOT NULL AND is_active = true);

-- Add constraint to prevent overlapping tokens for business-wide tokens (where employee_id is NULL)
ALTER TABLE public.shift_submission_tokens
ADD CONSTRAINT unique_business_date_range
EXCLUDE USING gist (
    business_id WITH =,
    daterange(week_start_date, week_end_date, '[]') WITH &&
) WHERE (employee_id IS NULL AND is_active = true);

-- Create function to automatically deactivate token after submission
CREATE OR REPLACE FUNCTION deactivate_token_after_submission()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the first submission for this token
  IF (SELECT COUNT(*) FROM public.public_shift_submissions WHERE token_id = NEW.token_id) = 1 THEN
    -- Get the token's max_submissions
    DECLARE
      max_subs INTEGER;
    BEGIN
      SELECT max_submissions INTO max_subs 
      FROM public.shift_submission_tokens 
      WHERE id = NEW.token_id;
      
      -- If max_submissions is 1, deactivate the token
      IF max_subs = 1 THEN
        UPDATE public.shift_submission_tokens 
        SET is_active = false 
        WHERE id = NEW.token_id;
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to deactivate token after submission
CREATE TRIGGER trigger_deactivate_token_after_submission
  AFTER INSERT ON public.public_shift_submissions
  FOR EACH ROW EXECUTE FUNCTION deactivate_token_after_submission();