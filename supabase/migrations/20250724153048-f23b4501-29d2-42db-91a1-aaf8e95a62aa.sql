-- Continue fixing security issues - Add missing policies for remaining tables and restrict more anonymous access

-- Add policies for remaining tables without RLS policies
-- employee_shift_requests table
CREATE POLICY "Business users can manage employee shift requests"
ON public.employee_shift_requests
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = employee_shift_requests.employee_id 
    AND e.business_id = ANY (get_user_business_ids())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = employee_shift_requests.employee_id 
    AND e.business_id = ANY (get_user_business_ids())
  )
);

-- leads_opportunities table  
CREATE POLICY "Business users can manage leads opportunities"
ON public.leads_opportunities
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM leads l 
    WHERE l.id = leads_opportunities.lead_id 
    AND l.business_id = ANY (get_user_business_ids())
  ) OR
  EXISTS (
    SELECT 1 FROM opportunities o 
    WHERE o.id = leads_opportunities.opportunity_id 
    AND o.business_id = ANY (get_user_business_ids())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM leads l 
    WHERE l.id = leads_opportunities.lead_id 
    AND l.business_id = ANY (get_user_business_ids())
  ) OR
  EXISTS (
    SELECT 1 FROM opportunities o 
    WHERE o.id = leads_opportunities.opportunity_id 
    AND o.business_id = ANY (get_user_business_ids())
  )
);

-- quick_access_tokens table
CREATE POLICY "Business users can manage quick access tokens"
ON public.quick_access_tokens
FOR ALL
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

-- schedule_patterns table
CREATE POLICY "Business users can manage schedule patterns"
ON public.schedule_patterns
FOR ALL
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

-- vacation_requests table  
CREATE POLICY "Business users can manage vacation requests"
ON public.vacation_requests
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = vacation_requests.employee_id 
    AND e.business_id = ANY (get_user_business_ids())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = vacation_requests.employee_id 
    AND e.business_id = ANY (get_user_business_ids())
  )
);

-- whatsapp_integrations table
CREATE POLICY "Business users can manage whatsapp integrations"
ON public.whatsapp_integrations
FOR ALL
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

-- Fix remaining critical function search paths
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'super_admin'
  );
$function$;

CREATE OR REPLACE FUNCTION public.update_document_recipient_counts()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE employee_documents 
    SET recipients_count = recipients_count + 1
    WHERE id = NEW.document_id;
    
    IF NEW.status = 'signed' THEN
      UPDATE employee_documents 
      SET signed_count = signed_count + 1
      WHERE id = NEW.document_id;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If status changed from not signed to signed
    IF OLD.status != 'signed' AND NEW.status = 'signed' THEN
      UPDATE employee_documents 
      SET signed_count = signed_count + 1
      WHERE id = NEW.document_id;
    -- If status changed from signed to not signed
    ELSIF OLD.status = 'signed' AND NEW.status != 'signed' THEN
      UPDATE employee_documents 
      SET signed_count = signed_count - 1
      WHERE id = NEW.document_id;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE employee_documents 
    SET recipients_count = recipients_count - 1
    WHERE id = OLD.document_id;
    
    IF OLD.status = 'signed' THEN
      UPDATE employee_documents 
      SET signed_count = signed_count - 1
      WHERE id = OLD.document_id;
    END IF;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$function$;

-- Restrict more critical policies to authenticated users only
-- Update all business-related policies to require authentication
DROP POLICY IF EXISTS "Users can manage general settings for their businesses" ON public.business_general_settings;
CREATE POLICY "Authenticated users can manage general settings for their businesses"
ON public.business_general_settings
FOR ALL
TO authenticated
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

DROP POLICY IF EXISTS "Users can manage available shifts for their businesses" ON public.available_shifts;
CREATE POLICY "Authenticated users can manage available shifts for their businesses"
ON public.available_shifts
FOR ALL
TO authenticated
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

DROP POLICY IF EXISTS "Users can view branches of their current business" ON public.branches;
DROP POLICY IF EXISTS "Users can update branches of their businesses" ON public.branches;
DROP POLICY IF EXISTS "Users can delete branches of their businesses" ON public.branches;

CREATE POLICY "Authenticated users can view branches of their current business"
ON public.branches
FOR SELECT
TO authenticated
USING (business_id = ANY (get_user_business_ids()));

CREATE POLICY "Authenticated users can update branches of their businesses"
ON public.branches
FOR UPDATE
TO authenticated
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

CREATE POLICY "Authenticated users can delete branches of their businesses"
ON public.branches
FOR DELETE
TO authenticated
USING (business_id = ANY (get_user_business_ids()));

DROP POLICY IF EXISTS "Users can manage tokens for their businesses" ON public.shift_submission_tokens;
DROP POLICY IF EXISTS "Users can view tokens for their businesses" ON public.shift_submission_tokens;
DROP POLICY IF EXISTS "Users can update tokens for their businesses" ON public.shift_submission_tokens;
DROP POLICY IF EXISTS "Users can delete tokens for their businesses" ON public.shift_submission_tokens;

CREATE POLICY "Authenticated users can manage tokens for their businesses"
ON public.shift_submission_tokens
FOR ALL
TO authenticated
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));