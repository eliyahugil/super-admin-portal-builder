-- Create shift_submissions table for weekly shift submissions
CREATE TABLE IF NOT EXISTS public.shift_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  shifts JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  optional_morning_availability INTEGER[] DEFAULT '{}',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent duplicate submissions per employee per week
CREATE UNIQUE INDEX IF NOT EXISTS idx_shift_submissions_employee_week 
ON public.shift_submissions(employee_id, week_start_date, week_end_date);

-- Enable RLS
ALTER TABLE public.shift_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for shift_submissions
CREATE POLICY "Users can view submissions for their businesses"
ON public.shift_submissions
FOR SELECT
USING (
  employee_id IN (
    SELECT e.id FROM public.employees e
    WHERE e.business_id = ANY (get_user_business_ids())
  )
);

CREATE POLICY "System can insert shift submissions"
ON public.shift_submissions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update submissions for their businesses"
ON public.shift_submissions
FOR UPDATE
USING (
  employee_id IN (
    SELECT e.id FROM public.employees e
    WHERE e.business_id = ANY (get_user_business_ids())
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_shift_submissions_updated_at
BEFORE UPDATE ON public.shift_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();