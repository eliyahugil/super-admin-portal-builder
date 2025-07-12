
-- Add missing columns to scheduled_shifts table
ALTER TABLE public.scheduled_shifts 
ADD COLUMN IF NOT EXISTS start_time time without time zone,
ADD COLUMN IF NOT EXISTS end_time time without time zone,
ADD COLUMN IF NOT EXISTS role text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Update existing records to have default values
UPDATE public.scheduled_shifts 
SET 
  start_time = '09:00'::time,
  end_time = '17:00'::time,
  role = 'general',
  status = 'pending'
WHERE start_time IS NULL OR end_time IS NULL OR role IS NULL OR status IS NULL;

-- Create index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_scheduled_shifts_status ON public.scheduled_shifts (status);
