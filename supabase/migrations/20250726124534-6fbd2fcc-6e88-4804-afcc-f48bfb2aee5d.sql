
-- First, let's ensure we have the correct tables and fix any inconsistencies

-- Create shift_submission_tokens table if it doesn't exist with proper structure
CREATE TABLE IF NOT EXISTS public.shift_submission_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  business_id UUID NOT NULL,
  employee_id UUID NULL,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_submissions INTEGER NOT NULL DEFAULT 1,
  current_submissions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shift_submissions table to track submissions
CREATE TABLE IF NOT EXISTS public.shift_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token_id UUID NOT NULL REFERENCES public.shift_submission_tokens(id) ON DELETE CASCADE,
  employee_id UUID NULL,
  employee_name TEXT NOT NULL,
  phone TEXT NULL,
  shifts JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT NULL,
  optional_morning_availability INTEGER[] NULL,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shift_submission_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for shift_submission_tokens
DROP POLICY IF EXISTS "Public access to shift_submission_tokens" ON public.shift_submission_tokens;
CREATE POLICY "Public access to shift_submission_tokens" ON public.shift_submission_tokens
  FOR SELECT USING (is_active = true AND expires_at > now());

DROP POLICY IF EXISTS "Business users can manage tokens" ON public.shift_submission_tokens;
CREATE POLICY "Business users can manage tokens" ON public.shift_submission_tokens
  FOR ALL USING (business_id = ANY (get_user_business_ids()));

DROP POLICY IF EXISTS "Service role can access tokens" ON public.shift_submission_tokens;
CREATE POLICY "Service role can access tokens" ON public.shift_submission_tokens
  FOR ALL USING (true);

-- Create RLS policies for shift_submissions
DROP POLICY IF EXISTS "Public can insert submissions" ON public.shift_submissions;
CREATE POLICY "Public can insert submissions" ON public.shift_submissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shift_submission_tokens 
      WHERE id = token_id AND is_active = true AND expires_at > now()
    )
  );

DROP POLICY IF EXISTS "Business users can view submissions" ON public.shift_submissions;
CREATE POLICY "Business users can view submissions" ON public.shift_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.shift_submission_tokens sst 
      WHERE sst.id = token_id AND sst.business_id = ANY (get_user_business_ids())
    )
  );

DROP POLICY IF EXISTS "Service role can access submissions" ON public.shift_submissions;
CREATE POLICY "Service role can access submissions" ON public.shift_submissions
  FOR ALL USING (true);

-- Create unique constraint to prevent duplicate submissions
ALTER TABLE public.shift_submissions 
DROP CONSTRAINT IF EXISTS unique_token_submission;
ALTER TABLE public.shift_submissions 
ADD CONSTRAINT unique_token_submission UNIQUE (token_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shift_submission_tokens_business_week 
ON public.shift_submission_tokens(business_id, week_start_date, week_end_date);

CREATE INDEX IF NOT EXISTS idx_shift_submission_tokens_token 
ON public.shift_submission_tokens(token);

CREATE INDEX IF NOT EXISTS idx_shift_submissions_token_id 
ON public.shift_submissions(token_id);

-- Create trigger to update token usage
CREATE OR REPLACE FUNCTION update_token_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the token's current_submissions count
  UPDATE public.shift_submission_tokens 
  SET current_submissions = current_submissions + 1,
      updated_at = now()
  WHERE id = NEW.token_id;
  
  -- Deactivate token if max submissions reached
  UPDATE public.shift_submission_tokens 
  SET is_active = false,
      updated_at = now()
  WHERE id = NEW.token_id 
    AND current_submissions >= max_submissions;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_token_usage ON public.shift_submissions;
CREATE TRIGGER trigger_update_token_usage
  AFTER INSERT ON public.shift_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_token_usage();

-- Insert sample available shifts for current week to test the system
INSERT INTO public.available_shifts (business_id, branch_id, week_start_date, week_end_date, day_of_week, start_time, end_time, shift_type, shift_name, required_employees)
SELECT 
  'ceaee44e-663e-4c31-b873-a3a745921d12'::uuid as business_id,
  b.id as branch_id,
  date_trunc('week', CURRENT_DATE + interval '1 week')::date as week_start_date,
  (date_trunc('week', CURRENT_DATE + interval '1 week') + interval '6 days')::date as week_end_date,
  generate_series(0, 6) as day_of_week,
  '09:00'::time as start_time,
  '17:00'::time as end_time,
  'morning' as shift_type,
  'משמרת בוקר' as shift_name,
  1 as required_employees
FROM public.branches b
WHERE b.business_id = 'ceaee44e-663e-4c31-b873-a3a745921d12'::uuid
  AND b.is_active = true
ON CONFLICT DO NOTHING;

-- Create a sample token for testing
INSERT INTO public.shift_submission_tokens (
  token, 
  business_id, 
  employee_id, 
  week_start_date, 
  week_end_date, 
  expires_at, 
  is_active, 
  max_submissions
) VALUES (
  'test-token-123',
  'ceaee44e-663e-4c31-b873-a3a745921d12'::uuid,
  'e6ac21fe-c085-4aa0-ae36-8a7d904f7c74'::uuid,
  date_trunc('week', CURRENT_DATE + interval '1 week')::date,
  (date_trunc('week', CURRENT_DATE + interval '1 week') + interval '6 days')::date,
  now() + interval '30 days',
  true,
  1
) ON CONFLICT (token) DO UPDATE SET
  week_start_date = EXCLUDED.week_start_date,
  week_end_date = EXCLUDED.week_end_date,
  expires_at = EXCLUDED.expires_at,
  is_active = true,
  current_submissions = 0;
