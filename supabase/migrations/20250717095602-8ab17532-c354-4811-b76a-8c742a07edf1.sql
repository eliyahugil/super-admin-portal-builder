-- Add priority field to scheduled_shifts table
ALTER TABLE public.scheduled_shifts 
ADD COLUMN priority text DEFAULT 'normal';

-- Add comment to explain the priority values
COMMENT ON COLUMN public.scheduled_shifts.priority IS 'Priority level: critical (חובה), normal (רגיל), backup (תגבור)';

-- Create employee preferences table for shift preferences
CREATE TABLE public.employee_shift_preferences_v2 (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  business_id UUID NOT NULL,
  preference_type text NOT NULL, -- 'shift_type', 'day_preference', 'time_preference', 'branch_preference'
  preference_value jsonb NOT NULL, -- flexible storage for different preference types
  priority_score integer DEFAULT 5, -- 1-10 scale where 10 is highest preference
  is_active boolean DEFAULT true,
  notes text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_shift_preferences_v2 ENABLE ROW LEVEL SECURITY;

-- Create policies for employee preferences
CREATE POLICY "Users can view preferences for their business employees" 
ON public.employee_shift_preferences_v2 
FOR SELECT 
USING (business_id = ANY (get_user_business_ids()));

CREATE POLICY "Users can create preferences for their business employees" 
ON public.employee_shift_preferences_v2 
FOR INSERT 
WITH CHECK (business_id = ANY (get_user_business_ids()));

CREATE POLICY "Users can update preferences for their business employees" 
ON public.employee_shift_preferences_v2 
FOR UPDATE 
USING (business_id = ANY (get_user_business_ids()));

CREATE POLICY "Users can delete preferences for their business employees" 
ON public.employee_shift_preferences_v2 
FOR DELETE 
USING (business_id = ANY (get_user_business_ids()));

-- Add foreign key constraints
ALTER TABLE public.employee_shift_preferences_v2 
ADD CONSTRAINT fk_employee_shift_preferences_v2_employee 
FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

ALTER TABLE public.employee_shift_preferences_v2 
ADD CONSTRAINT fk_employee_shift_preferences_v2_business 
FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_employee_shift_preferences_v2_employee_id 
ON public.employee_shift_preferences_v2(employee_id);

CREATE INDEX idx_employee_shift_preferences_v2_business_id 
ON public.employee_shift_preferences_v2(business_id);

CREATE INDEX idx_employee_shift_preferences_v2_type 
ON public.employee_shift_preferences_v2(preference_type);

-- Create trigger for updated_at
CREATE TRIGGER update_employee_shift_preferences_v2_updated_at
BEFORE UPDATE ON public.employee_shift_preferences_v2
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();