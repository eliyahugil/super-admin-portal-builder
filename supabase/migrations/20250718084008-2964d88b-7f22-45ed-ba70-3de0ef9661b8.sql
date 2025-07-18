-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS trigger_activate_tokens_on_new_shifts ON public.available_shifts;
DROP TRIGGER IF EXISTS trigger_deactivate_token_after_submission ON public.public_shift_submissions;
DROP FUNCTION IF EXISTS public.deactivate_token_after_submission();
DROP FUNCTION IF EXISTS public.check_and_update_token_status();

-- Create new function to handle token activation based on available shifts
CREATE OR REPLACE FUNCTION public.check_and_update_token_status()
RETURNS TRIGGER AS $$
BEGIN
  -- When new available shifts are created, activate matching tokens
  IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'available_shifts' THEN
    UPDATE public.shift_submission_tokens 
    SET is_active = true
    WHERE business_id = NEW.business_id
      AND week_start_date = NEW.week_start_date
      AND week_end_date = NEW.week_end_date
      AND is_active = false;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for available shifts
CREATE TRIGGER trigger_activate_tokens_on_new_shifts
  AFTER INSERT ON public.available_shifts
  FOR EACH ROW EXECUTE FUNCTION public.check_and_update_token_status();

-- Create function to deactivate token for specific week after submission  
CREATE OR REPLACE FUNCTION public.deactivate_token_for_week()
RETURNS TRIGGER AS $$
DECLARE
  token_week_start DATE;
  token_week_end DATE;
BEGIN
  -- Get the token's week dates
  SELECT week_start_date, week_end_date 
  INTO token_week_start, token_week_end
  FROM public.shift_submission_tokens 
  WHERE id = NEW.token_id;
  
  -- Deactivate token only if submission is for the current token week
  UPDATE public.shift_submission_tokens 
  SET is_active = false 
  WHERE id = NEW.token_id
    AND week_start_date = token_week_start
    AND week_end_date = token_week_end;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to deactivate token for specific week after submission
CREATE TRIGGER trigger_deactivate_token_for_week
  AFTER INSERT ON public.public_shift_submissions
  FOR EACH ROW EXECUTE FUNCTION public.deactivate_token_for_week();

-- Add function to manually toggle token status
CREATE OR REPLACE FUNCTION public.toggle_token_status(token_id_param uuid, new_status boolean)
RETURNS void AS $$
BEGIN
  UPDATE public.shift_submission_tokens 
  SET is_active = new_status
  WHERE id = token_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;