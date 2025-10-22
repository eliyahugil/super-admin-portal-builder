-- יצירת משתמש מנהל לעסק הקיים "שרון ושלמה.ג"
-- זה ייעשה באמצעות הוספה ישירה לטבלת profiles
-- המשתמש עצמו ייווצר בנפרד

DO $$
DECLARE
  v_business_id UUID := 'f61e330f-ab0f-4407-9f6f-fb9474f8ef79';
  v_admin_email TEXT := 'boraxgil69@gmail.com';
BEGIN
  -- עדכון פרטי העסק
  UPDATE businesses
  SET 
    contact_email = v_admin_email,
    admin_email = v_admin_email,
    updated_at = now()
  WHERE id = v_business_id;
  
  RAISE NOTICE 'Business updated successfully. Please create user manually via Supabase Auth with email: %', v_admin_email;
END $$;