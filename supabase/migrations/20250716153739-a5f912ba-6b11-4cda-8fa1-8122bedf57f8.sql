-- Create table for quick add employee tokens
CREATE TABLE public.employee_quick_add_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_quick_add_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view tokens for their businesses"
ON public.employee_quick_add_tokens
FOR SELECT
USING (business_id IN (
  SELECT id FROM public.businesses 
  WHERE owner_id = auth.uid()
));

CREATE POLICY "Users can create tokens for their businesses"
ON public.employee_quick_add_tokens
FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT id FROM public.businesses 
    WHERE owner_id = auth.uid()
  ) AND 
  created_by = auth.uid()
);

CREATE POLICY "Users can update tokens for their businesses"
ON public.employee_quick_add_tokens
FOR UPDATE
USING (business_id IN (
  SELECT id FROM public.businesses 
  WHERE owner_id = auth.uid()
));

-- Create index for performance
CREATE INDEX idx_employee_quick_add_tokens_business_id ON public.employee_quick_add_tokens(business_id);
CREATE INDEX idx_employee_quick_add_tokens_token ON public.employee_quick_add_tokens(token);
CREATE INDEX idx_employee_quick_add_tokens_expires_at ON public.employee_quick_add_tokens(expires_at);