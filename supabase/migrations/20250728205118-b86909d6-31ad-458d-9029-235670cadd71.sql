-- Fix RLS policy for employee registration requests to allow anonymous access with valid token

-- Drop existing policies
DROP POLICY IF EXISTS "Public can submit registration requests with valid token" ON public.employee_registration_requests;
DROP POLICY IF EXISTS "Business users can view registration requests for their business" ON public.employee_registration_requests;
DROP POLICY IF EXISTS "Business users can update registration requests for their business" ON public.employee_registration_requests;

-- Create new policy that allows anonymous access with valid token
CREATE POLICY "Allow anonymous registration with valid token" 
ON public.employee_registration_requests 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM employee_registration_tokens ert
    WHERE ert.id = employee_registration_requests.token_id
      AND ert.business_id = employee_registration_requests.business_id
      AND ert.is_active = true
      AND (ert.expires_at IS NULL OR ert.expires_at > now())
      AND (ert.max_registrations IS NULL OR ert.current_registrations < ert.max_registrations)
  )
);

-- Business users can view and manage registration requests for their business
CREATE POLICY "Business users can view registration requests for their business" 
ON public.employee_registration_requests 
FOR SELECT 
USING (
  business_id = ANY (get_user_business_ids())
);

CREATE POLICY "Business users can update registration requests for their business" 
ON public.employee_registration_requests 
FOR UPDATE 
USING (
  business_id = ANY (get_user_business_ids())
)
WITH CHECK (
  business_id = ANY (get_user_business_ids())
);