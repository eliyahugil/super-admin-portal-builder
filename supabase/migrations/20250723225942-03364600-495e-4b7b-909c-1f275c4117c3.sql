
-- Add missing columns to scheduled_shifts table
ALTER TABLE public.scheduled_shifts 
ADD COLUMN IF NOT EXISTS required_employees integer,
ADD COLUMN IF NOT EXISTS priority text,
ADD COLUMN IF NOT EXISTS shift_assignments jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_new boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS shift_template_id uuid,
ADD COLUMN IF NOT EXISTS manager_override boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS override_by uuid,
ADD COLUMN IF NOT EXISTS override_at timestamp with time zone;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scheduled_shifts_priority ON public.scheduled_shifts (priority);
CREATE INDEX IF NOT EXISTS idx_scheduled_shifts_is_new ON public.scheduled_shifts (is_new);
CREATE INDEX IF NOT EXISTS idx_scheduled_shifts_template ON public.scheduled_shifts (shift_template_id);

-- Add trigger to auto-update shift_assignments if needed
CREATE OR REPLACE FUNCTION update_shift_assignments() RETURNS TRIGGER AS $$
BEGIN
  -- אם אין הקצאות, צור הקצאה ראשונית
  IF NEW.shift_assignments IS NULL OR jsonb_array_length(NEW.shift_assignments) = 0 THEN
    NEW.shift_assignments = jsonb_build_array(
      jsonb_build_object(
        'id', gen_random_uuid()::text,
        'type', 'חובה',
        'employee_id', NEW.employee_id,
        'position', 1,
        'is_required', true
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for shift assignments
DROP TRIGGER IF EXISTS trigger_update_shift_assignments ON public.scheduled_shifts;
CREATE TRIGGER trigger_update_shift_assignments
  BEFORE INSERT OR UPDATE ON public.scheduled_shifts
  FOR EACH ROW
  EXECUTE FUNCTION update_shift_assignments();
