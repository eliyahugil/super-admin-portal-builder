-- Fix profiles RLS policies to allow super admins to view all profiles
-- First, drop any duplicate policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;

-- Create clean, simple policies
CREATE POLICY "Super admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO public
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO public
USING (auth.uid() = id);

CREATE POLICY "Super admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
TO public
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO public
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO public
WITH CHECK (auth.uid() = id);