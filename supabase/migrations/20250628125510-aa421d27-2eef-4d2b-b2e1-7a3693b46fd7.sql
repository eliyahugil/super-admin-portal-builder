
-- Update branches table to ensure GPS fields are properly configured
ALTER TABLE public.branches 
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC,
ADD COLUMN IF NOT EXISTS gps_radius INTEGER DEFAULT 100;

-- Add check constraint to ensure GPS radius is reasonable
ALTER TABLE public.branches 
ADD CONSTRAINT check_gps_radius_valid 
CHECK (gps_radius IS NULL OR (gps_radius >= 10 AND gps_radius <= 5000));

-- Add index for better performance on GPS queries
CREATE INDEX IF NOT EXISTS idx_branches_gps ON public.branches(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add review_notes column to employee_shift_requests if it doesn't exist
ALTER TABLE public.employee_shift_requests 
ADD COLUMN IF NOT EXISTS review_notes TEXT;
