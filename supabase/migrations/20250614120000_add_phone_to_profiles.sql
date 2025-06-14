
-- Add phone field to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;

-- Update the trigger function to handle phone number
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Add a small delay to ensure user data is fully committed
  PERFORM pg_sleep(0.1);
  
  INSERT INTO public.profiles (id, email, full_name, phone, role, business_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'phone', ''),
    CASE 
      -- רק המשתמש הספציפי הזה יקבל super_admin
      WHEN new.email = 'eligil1308@gmail.com' THEN 'super_admin'::user_role
      -- אם יש מידע על עסק ב-metadata, זה יהיה business_admin
      WHEN new.raw_user_meta_data ->> 'role' = 'business_admin' THEN 'business_admin'::user_role
      -- כל שאר המשתמשים יהיו business_admin ללא עסק מוקצה
      ELSE 'business_admin'::user_role
    END,
    -- אם יש business_id ב-metadata, נשתמש בו
    CASE 
      WHEN new.raw_user_meta_data ->> 'business_id' IS NOT NULL 
      THEN (new.raw_user_meta_data ->> 'business_id')::uuid
      ELSE NULL
    END
  );
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't prevent user creation
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    -- Still try to create a basic profile
    BEGIN
      INSERT INTO public.profiles (id, email, full_name, phone, role, business_id)
      VALUES (new.id, new.email, '', '', 'business_admin'::user_role, NULL);
    EXCEPTION
      WHEN OTHERS THEN
        -- If this also fails, just log and continue
        RAISE LOG 'Failed to create fallback profile: %', SQLERRM;
    END;
    RETURN new;
END;
$function$;
