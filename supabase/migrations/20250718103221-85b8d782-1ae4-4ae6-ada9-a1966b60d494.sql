-- Fix infinite recursion in profiles table RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Super admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create new secure policies without recursion
CREATE POLICY "Profiles are viewable by owner"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Profiles are updatable by owner"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Super admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'super_admin'
  )
);

-- Fix the user_businesses policies to avoid recursion
DROP POLICY IF EXISTS "Users can view their own business associations" ON public.user_businesses;
DROP POLICY IF EXISTS "Super admins can view all business associations" ON public.user_businesses;
DROP POLICY IF EXISTS "Business owners can manage their business associations" ON public.user_businesses;

CREATE POLICY "Users can view their business associations"
ON public.user_businesses
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all business associations"
ON public.user_businesses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'super_admin'
  )
);

CREATE POLICY "Business owners can manage business associations"
ON public.user_businesses
FOR ALL
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'super_admin'
  )
);