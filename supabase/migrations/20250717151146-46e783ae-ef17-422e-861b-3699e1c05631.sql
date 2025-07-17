-- Create table for employee default shift preferences (global settings)
CREATE TABLE public.employee_default_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  business_id UUID NOT NULL,
  available_days INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6],
  shift_types TEXT[] DEFAULT ARRAY['morning','evening'],
  max_weekly_hours INTEGER DEFAULT 40,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, business_id)
);

-- Enable RLS
ALTER TABLE public.employee_default_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for employee default preferences
CREATE POLICY "Users can view employee default preferences for their businesses" 
ON public.employee_default_preferences 
FOR SELECT 
USING (
  business_id IN (
    SELECT DISTINCT business_id 
    FROM public.user_businesses 
    WHERE user_id = auth.uid()
    UNION
    SELECT business_id 
    FROM public.profiles 
    WHERE id = auth.uid() AND business_id IS NOT NULL
  )
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

CREATE POLICY "Users can insert employee default preferences for their businesses" 
ON public.employee_default_preferences 
FOR INSERT 
WITH CHECK (
  business_id IN (
    SELECT DISTINCT business_id 
    FROM public.user_businesses 
    WHERE user_id = auth.uid()
    UNION
    SELECT business_id 
    FROM public.profiles 
    WHERE id = auth.uid() AND business_id IS NOT NULL
  )
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

CREATE POLICY "Users can update employee default preferences for their businesses" 
ON public.employee_default_preferences 
FOR UPDATE 
USING (
  business_id IN (
    SELECT DISTINCT business_id 
    FROM public.user_businesses 
    WHERE user_id = auth.uid()
    UNION
    SELECT business_id 
    FROM public.profiles 
    WHERE id = auth.uid() AND business_id IS NOT NULL
  )
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

CREATE POLICY "Users can delete employee default preferences for their businesses" 
ON public.employee_default_preferences 
FOR DELETE 
USING (
  business_id IN (
    SELECT DISTINCT business_id 
    FROM public.user_businesses 
    WHERE user_id = auth.uid()
    UNION
    SELECT business_id 
    FROM public.profiles 
    WHERE id = auth.uid() AND business_id IS NOT NULL
  )
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Add trigger for updating timestamps
CREATE TRIGGER update_employee_default_preferences_updated_at
BEFORE UPDATE ON public.employee_default_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get employee shift preferences with hierarchy
CREATE OR REPLACE FUNCTION public.get_employee_shift_preferences(
  employee_id_param UUID,
  branch_id_param UUID DEFAULT NULL
)
RETURNS TABLE(
  available_days INTEGER[],
  shift_types TEXT[],
  max_weekly_hours INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  branch_preferences RECORD;
  default_preferences RECORD;
BEGIN
  -- First, try to get branch-specific preferences
  IF branch_id_param IS NOT NULL THEN
    SELECT ba.available_days, ba.shift_types, ba.max_weekly_hours
    INTO branch_preferences
    FROM public.employee_branch_assignments ba
    WHERE ba.employee_id = employee_id_param 
      AND ba.branch_id = branch_id_param 
      AND ba.is_active = true
    LIMIT 1;
    
    -- If found branch-specific preferences, return them
    IF FOUND THEN
      RETURN QUERY SELECT 
        branch_preferences.available_days,
        branch_preferences.shift_types,
        branch_preferences.max_weekly_hours;
      RETURN;
    END IF;
  END IF;
  
  -- If no branch-specific preferences, get default preferences
  SELECT edp.available_days, edp.shift_types, edp.max_weekly_hours
  INTO default_preferences
  FROM public.employee_default_preferences edp
  WHERE edp.employee_id = employee_id_param
  LIMIT 1;
  
  -- If found default preferences, return them
  IF FOUND THEN
    RETURN QUERY SELECT 
      default_preferences.available_days,
      default_preferences.shift_types,
      default_preferences.max_weekly_hours;
    RETURN;
  END IF;
  
  -- If no preferences found at all, return defaults
  RETURN QUERY SELECT 
    ARRAY[0,1,2,3,4,5,6]::INTEGER[],
    ARRAY['morning','evening']::TEXT[],
    40::INTEGER;
END;
$$;