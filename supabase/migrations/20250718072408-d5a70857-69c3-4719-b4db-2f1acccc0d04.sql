-- Add birth_date column to employees table
ALTER TABLE public.employees 
ADD COLUMN birth_date DATE NULL;

-- Add is_first_login column to track if user needs to set birth date
ALTER TABLE public.employees 
ADD COLUMN is_first_login BOOLEAN NOT NULL DEFAULT true;

-- Create index for better performance on phone-based lookups
CREATE INDEX IF NOT EXISTS idx_employees_phone 
ON public.employees (phone) 
WHERE phone IS NOT NULL;