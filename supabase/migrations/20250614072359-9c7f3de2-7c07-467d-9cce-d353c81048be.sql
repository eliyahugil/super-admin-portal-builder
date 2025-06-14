
-- עדכון הטריגר כדי לוודא שרק eligil1308@gmail.com יקבל הרשאות super admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Add a small delay to ensure user data is fully committed
  PERFORM pg_sleep(0.1);
  
  INSERT INTO public.profiles (id, email, full_name, role, business_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    CASE 
      -- רק המשתמש הספציפי הזה יקבל super_admin
      WHEN new.email = 'eligil1308@gmail.com' THEN 'super_admin'::user_role
      -- כל שאר המשתמשים יהיו business_admin ללא עסק מוקצה
      ELSE 'business_admin'::user_role
    END,
    -- משתמשים חדשים לא יקושרו לעסק עד שיקבלו הרשאה
    NULL
  );
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't prevent user creation
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    -- Still try to create a basic profile
    BEGIN
      INSERT INTO public.profiles (id, email, full_name, role, business_id)
      VALUES (new.id, new.email, '', 'business_admin'::user_role, NULL);
    EXCEPTION
      WHEN OTHERS THEN
        -- If this also fails, just log and continue
        RAISE LOG 'Failed to create fallback profile: %', SQLERRM;
    END;
    RETURN new;
END;
$function$;

-- וידוא שהמשתמש הקיים eligil1308@gmail.com הוא super_admin
UPDATE public.profiles 
SET role = 'super_admin'::user_role 
WHERE email = 'eligil1308@gmail.com';

-- וידוא שכל שאר המשתמשים הם business_admin (אלא אם הם כבר super_admin)
UPDATE public.profiles 
SET role = 'business_admin'::user_role 
WHERE email != 'eligil1308@gmail.com' AND role != 'super_admin';
