-- Clean up and simplify profiles RLS policies
-- Drop all existing policies first
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;

-- Create simple, clear policies
CREATE POLICY "Super admin can view all profiles" 
ON public.profiles 
FOR SELECT 
TO public
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO public
USING (auth.uid() = id);

CREATE POLICY "Super admin can update all profiles" 
ON public.profiles 
FOR UPDATE 
TO public
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO public
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO public
WITH CHECK (auth.uid() = id);