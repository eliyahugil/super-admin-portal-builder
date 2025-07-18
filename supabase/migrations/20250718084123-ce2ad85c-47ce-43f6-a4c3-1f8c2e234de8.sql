-- Drop all existing triggers related to tokens
DROP TRIGGER IF EXISTS trigger_activate_tokens_on_new_shifts ON public.available_shifts;
DROP TRIGGER IF EXISTS trigger_deactivate_token_after_submission ON public.public_shift_submissions;
DROP TRIGGER IF EXISTS trigger_deactivate_token_for_week ON public.public_shift_submissions;

-- Drop all related functions
DROP FUNCTION IF EXISTS public.deactivate_token_after_submission() CASCADE;
DROP FUNCTION IF EXISTS public.check_and_update_token_status() CASCADE;
DROP FUNCTION IF EXISTS public.deactivate_token_for_week() CASCADE;

-- Create new function to handle token activation when new shifts are created
CREATE OR REPLACE FUNCTION public.activate_tokens_on_new_shifts()
RETURNS TRIGGER AS $$
BEGIN
  -- When new available shifts are created, activate matching tokens
  UPDATE public.shift_submission_tokens 
  SET is_active = true
  WHERE business_id = NEW.business_id
    AND week_start_date = NEW.week_start_date
    AND week_end_date = NEW.week_end_date;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for available shifts
CREATE TRIGGER trigger_activate_tokens_on_new_shifts
  AFTER INSERT ON public.available_shifts
  FOR EACH ROW EXECUTE FUNCTION public.activate_tokens_on_new_shifts();

-- Create function to deactivate token for specific week after submission  
CREATE OR REPLACE FUNCTION public.deactivate_token_for_submission_week()
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
  
  -- Deactivate token only for the specific week that was submitted
  UPDATE public.shift_submission_tokens 
  SET is_active = false 
  WHERE id = NEW.token_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to deactivate token after submission
CREATE TRIGGER trigger_deactivate_token_after_submission
  AFTER INSERT ON public.public_shift_submissions
  FOR EACH ROW EXECUTE FUNCTION public.deactivate_token_for_submission_week();

-- Add function to manually toggle token status
CREATE OR REPLACE FUNCTION public.toggle_token_status(token_id_param uuid, new_status boolean)
RETURNS void AS $$
BEGIN
  UPDATE public.shift_submission_tokens 
  SET is_active = new_status
  WHERE id = token_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;