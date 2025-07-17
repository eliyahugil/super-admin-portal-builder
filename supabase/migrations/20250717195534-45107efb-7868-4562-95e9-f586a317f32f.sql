-- Add missing columns to employee_weekly_tokens table for tracking submission status
ALTER TABLE public.employee_weekly_tokens 
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS choices_submitted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS shifts_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS context_type TEXT DEFAULT 'available_shifts' CHECK (context_type IN ('available_shifts', 'assigned_shifts'));