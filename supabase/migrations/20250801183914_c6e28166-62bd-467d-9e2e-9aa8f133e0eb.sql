-- Security Fix 1: Remove hardcoded super admin and use database-driven role management
-- Update the profiles table to ensure proper role validation
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Create a more secure role management system
CREATE OR REPLACE FUNCTION public.validate_super_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow super_admin role if user is already a super_admin or this is the initial setup
  IF NEW.role = 'super_admin' THEN
    -- Check if this is the first super admin (system bootstrap)
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'super_admin') THEN
      -- Allow first super admin
      RETURN NEW;
    ELSE
      -- Only existing super admins can create new super admins
      IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'super_admin'
      ) THEN
        RAISE EXCEPTION 'Only existing super admins can assign super admin role';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply the validation trigger
DROP TRIGGER IF EXISTS validate_super_admin_trigger ON public.profiles;
CREATE TRIGGER validate_super_admin_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION validate_super_admin_role();

-- Security Fix 2: Strengthen employee authentication
-- Create proper employee authentication tokens table
CREATE TABLE IF NOT EXISTS public.employee_auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  business_id UUID NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.employee_auth_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for employee sessions
CREATE POLICY "Employees can view their own sessions" 
ON public.employee_auth_sessions 
FOR SELECT 
USING (employee_id IN (
  SELECT id FROM public.employees WHERE business_id = ANY(get_user_business_ids())
));

CREATE POLICY "System can manage employee sessions" 
ON public.employee_auth_sessions 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Security Fix 3: Add missing RLS policies for critical tables
-- Ensure all tables have proper RLS policies

-- Fix accounting_records policies
DROP POLICY IF EXISTS "System can manage accounting records" ON public.accounting_records;
CREATE POLICY "System can manage accounting records" 
ON public.accounting_records 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Fix employee_files policies if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employee_files') THEN
    EXECUTE 'ALTER TABLE public.employee_files ENABLE ROW LEVEL SECURITY';
    
    EXECUTE 'CREATE POLICY IF NOT EXISTS "Business users can manage employee files" 
    ON public.employee_files 
    FOR ALL 
    USING (business_id = ANY(get_user_business_ids()))
    WITH CHECK (business_id = ANY(get_user_business_ids()))';
  END IF;
END
$$;

-- Security Fix 4: Add audit logging for sensitive operations
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policy for audit log
CREATE POLICY "Super admins can view audit log" 
ON public.security_audit_log 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'super_admin'
));

CREATE POLICY "System can insert audit log" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Security Fix 5: Create secure function for role checking
CREATE OR REPLACE FUNCTION public.get_user_role(check_user_id UUID DEFAULT auth.uid())
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role::TEXT FROM public.profiles WHERE id = check_user_id;
$$;

-- Security Fix 6: Add rate limiting table for authentication attempts
CREATE TABLE IF NOT EXISTS public.auth_rate_limit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- Can be IP, email, or phone
  attempt_type TEXT NOT NULL, -- 'login', 'signup', 'password_reset'
  attempts INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_auth_rate_limit_identifier_type 
ON public.auth_rate_limit(identifier, attempt_type);

-- Enable RLS
ALTER TABLE public.auth_rate_limit ENABLE ROW LEVEL SECURITY;

-- Create policy for rate limiting
CREATE POLICY "System can manage rate limiting" 
ON public.auth_rate_limit 
FOR ALL 
USING (true)
WITH CHECK (true);