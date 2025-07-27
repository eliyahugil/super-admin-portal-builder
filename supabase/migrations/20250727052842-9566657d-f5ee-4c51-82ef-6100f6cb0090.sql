
-- Create shift_submission_reminders table
CREATE TABLE IF NOT EXISTS public.shift_submission_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  employee_ids UUID[] NOT NULL,
  reminder_type TEXT NOT NULL DEFAULT 'weekly_submission',
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  message TEXT
);

-- Add RLS policies
ALTER TABLE public.shift_submission_reminders ENABLE ROW LEVEL SECURITY;

-- Policy for business users to manage their reminders
CREATE POLICY "Business users can manage shift submission reminders"
  ON public.shift_submission_reminders
  FOR ALL
  USING (business_id = ANY(get_user_business_ids()))
  WITH CHECK (business_id = ANY(get_user_business_ids()));
