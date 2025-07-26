-- Create table for business shift type definitions
CREATE TABLE IF NOT EXISTS public.business_shift_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  shift_type TEXT NOT NULL,
  display_name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, shift_type)
);

-- Enable RLS
ALTER TABLE public.business_shift_types ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage shift types for their businesses"
ON public.business_shift_types
FOR ALL
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

-- Insert default shift types for existing business
INSERT INTO public.business_shift_types (business_id, shift_type, display_name, start_time, end_time, color)
VALUES 
  ('ceaee44e-663e-4c31-b873-a3a745921d12', 'morning', 'בוקר', '06:00:00', '14:00:00', '#FCD34D'),
  ('ceaee44e-663e-4c31-b873-a3a745921d12', 'afternoon', 'אחר צהריים', '14:00:00', '18:00:00', '#F97316'),
  ('ceaee44e-663e-4c31-b873-a3a745921d12', 'evening', 'ערב', '18:00:00', '06:00:00', '#8B5CF6')
ON CONFLICT (business_id, shift_type) DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_business_shift_types_updated_at
  BEFORE UPDATE ON public.business_shift_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();