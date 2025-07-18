-- Create a security definer function to check user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM auth.users au
  JOIN public.profiles p ON p.id = au.id
  WHERE au.id = auth.uid()
  LIMIT 1;
$$;

-- Drop the problematic super admin policies that cause recursion
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;

-- Create new super admin policies using the security definer function
CREATE POLICY "Super admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.get_current_user_role() = 'super_admin');

CREATE POLICY "Super admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.get_current_user_role() = 'super_admin');

-- Also fix user_businesses policies to use the security definer function
DROP POLICY IF EXISTS "Super admins can view all business associations" ON public.user_businesses;
DROP POLICY IF EXISTS "Business owners can manage business associations" ON public.user_businesses;

CREATE POLICY "Super admins can view all business associations"
ON public.user_businesses
FOR SELECT
USING (public.get_current_user_role() = 'super_admin');

CREATE POLICY "Business owners can manage business associations"
ON public.user_businesses
FOR ALL
USING (
  user_id = auth.uid() OR 
  public.get_current_user_role() = 'super_admin'
);