-- Make shift_template_id nullable in scheduled_shifts table
ALTER TABLE public.scheduled_shifts 
ALTER COLUMN shift_template_id DROP NOT NULL;