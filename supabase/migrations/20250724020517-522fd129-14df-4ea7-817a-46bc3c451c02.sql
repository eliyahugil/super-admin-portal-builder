-- Fix RLS policies for employee_registration_requests table
-- Allow public insert for registration form submissions

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'employee_registration_requests';

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Business users can view registration requests" ON public.employee_registration_requests;
DROP POLICY IF EXISTS "Business users can update registration requests" ON public.employee_registration_requests;

-- Create proper policies for employee registration requests
CREATE POLICY "Public can insert employee registration requests with valid token"
ON public.employee_registration_requests
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.employee_registration_tokens ert
    WHERE ert.id = employee_registration_requests.token_id
      AND ert.is_active = true
      AND (ert.expires_at IS NULL OR ert.expires_at > now())
      AND (ert.max_registrations IS NULL OR ert.current_registrations < ert.max_registrations)
  )
);

-- Allow business users to view and manage requests for their business
CREATE POLICY "Business users can view registration requests for their business"
ON public.employee_registration_requests
FOR SELECT
USING (
  business_id IN (
    SELECT DISTINCT b.id
    FROM public.businesses b
    JOIN public.profiles p ON p.business_id = b.id OR b.owner_id = p.id
    WHERE p.id = auth.uid()
      AND p.role IN ('business_admin', 'super_admin')
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Allow business users to update requests for their business
CREATE POLICY "Business users can update registration requests for their business"
ON public.employee_registration_requests
FOR UPDATE
USING (
  business_id IN (
    SELECT DISTINCT b.id
    FROM public.businesses b
    JOIN public.profiles p ON p.business_id = b.id OR b.owner_id = p.id
    WHERE p.id = auth.uid()
      AND p.role IN ('business_admin', 'super_admin')
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);