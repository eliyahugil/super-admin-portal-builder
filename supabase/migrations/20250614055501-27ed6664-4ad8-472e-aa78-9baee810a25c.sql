
-- Add is_archived column to employees table for logical deletion
ALTER TABLE public.employees 
ADD COLUMN is_archived boolean NOT NULL DEFAULT false;

-- Create index for better performance when filtering archived employees
CREATE INDEX IF NOT EXISTS idx_employees_is_archived 
ON public.employees(is_archived);

-- Create index for combined filtering (active and not archived)
CREATE INDEX IF NOT EXISTS idx_employees_active_not_archived 
ON public.employees(is_active, is_archived) 
WHERE is_active = true AND is_archived = false;
