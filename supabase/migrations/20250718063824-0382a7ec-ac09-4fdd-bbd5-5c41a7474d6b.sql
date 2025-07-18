-- Create shift submission tokens table
CREATE TABLE public.shift_submission_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  employee_id UUID NULL REFERENCES public.employees(id) ON DELETE SET NULL,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  max_submissions INTEGER DEFAULT 50,
  current_submissions INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for better performance
CREATE INDEX idx_shift_submission_tokens_token ON public.shift_submission_tokens(token);
CREATE INDEX idx_shift_submission_tokens_business_id ON public.shift_submission_tokens(business_id);

-- Enable RLS
ALTER TABLE public.shift_submission_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage tokens for their businesses" 
ON public.shift_submission_tokens 
FOR ALL 
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

-- Create public shift submissions table
CREATE TABLE public.public_shift_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token_id UUID NOT NULL REFERENCES public.shift_submission_tokens(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  shift_preferences JSONB NOT NULL,
  notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE NULL,
  processed_by UUID NULL REFERENCES auth.users(id)
);

-- Create index for better performance
CREATE INDEX idx_public_shift_submissions_token_id ON public.public_shift_submissions(token_id);

-- Enable RLS
ALTER TABLE public.public_shift_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for submissions
CREATE POLICY "Anyone can submit shifts with valid token" 
ON public.public_shift_submissions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.shift_submission_tokens 
    WHERE id = public_shift_submissions.token_id 
    AND is_active = true 
    AND expires_at > now()
    AND (max_submissions IS NULL OR current_submissions < max_submissions)
  )
);

-- Business users can view submissions for their tokens
CREATE POLICY "Users can view submissions for their business tokens" 
ON public.public_shift_submissions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.shift_submission_tokens sst
    WHERE sst.id = public_shift_submissions.token_id 
    AND sst.business_id = ANY (get_user_business_ids())
  )
);

-- Business users can update submissions for their tokens
CREATE POLICY "Users can update submissions for their business tokens" 
ON public.public_shift_submissions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.shift_submission_tokens sst
    WHERE sst.id = public_shift_submissions.token_id 
    AND sst.business_id = ANY (get_user_business_ids())
  )
);

-- Create trigger to update submission count
CREATE OR REPLACE FUNCTION update_token_submission_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.shift_submission_tokens 
    SET current_submissions = current_submissions + 1
    WHERE id = NEW.token_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.shift_submission_tokens 
    SET current_submissions = current_submissions - 1
    WHERE id = OLD.token_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_token_submission_count
  AFTER INSERT OR DELETE ON public.public_shift_submissions
  FOR EACH ROW EXECUTE FUNCTION update_token_submission_count();