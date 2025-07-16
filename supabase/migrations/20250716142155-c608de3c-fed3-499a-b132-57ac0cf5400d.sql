-- Create user_role enum type that's missing
CREATE TYPE public.user_role AS ENUM ('super_admin', 'business_admin', 'business_user');

-- Update the profiles table to use the correct enum type
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE public.user_role USING role::text::public.user_role;