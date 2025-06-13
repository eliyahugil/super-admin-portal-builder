
-- יצירת עסק דמו (מתוקן - גרסה 3)
INSERT INTO public.businesses (
  name,
  admin_email,
  contact_email,
  contact_phone,
  address,
  description,
  is_active
) VALUES (
  'חברת הדמו טק בעמ',
  'demo@company.com',
  'info@company.com',
  '03-1234567',
  'רחוב הטכנולוגיה 10, תל אביב',
  'חברת טכנולוגיה לדוגמה עם מערכת ניהול עובדים מתקדמת',
  true
);

-- שליפת מזהה העסק שנוצר ויצירת נתוני דמו
DO $$
DECLARE
    demo_business_id UUID;
    demo_branch_1_id UUID;
    demo_branch_2_id UUID;
    valid_user_id UUID;
BEGIN
    -- קבלת מזהה העסק
    SELECT id INTO demo_business_id FROM public.businesses WHERE name = 'חברת הדמו טק בעמ' ORDER BY created_at DESC LIMIT 1;
    
    -- יצירת סניפים
    INSERT INTO public.branches (business_id, name, address, latitude, longitude, gps_radius)
    VALUES 
        (demo_business_id, 'סניף תל אביב', 'רחוב הטכנולוגיה 10, תל אביב', 32.0853, 34.7818, 100),
        (demo_business_id, 'סניף חיפה', 'שדרות הנשיא 25, חיפה', 32.7940, 34.9896, 150);
    
    -- קבלת מזהי הסניפים
    SELECT id INTO demo_branch_1_id FROM public.branches WHERE business_id = demo_business_id AND name = 'סניף תל אביב';
    SELECT id INTO demo_branch_2_id FROM public.branches WHERE business_id = demo_business_id AND name = 'סניף חיפה';
    
    -- יצירת עובדים לדוגמה
    INSERT INTO public.employees (
        business_id,
        first_name,
        last_name,
        email,
        phone,
        address,
        employee_type,
        hire_date,
        weekly_hours_required,
        main_branch_id,
        employee_id,
        notes
    ) VALUES 
        (demo_business_id, 'יוסי', 'כהן', 'yossi.cohen@demo.com', '050-1234567', 'רחוב הרצל 15, תל אביב', 'permanent', '2024-01-15', 42, demo_branch_1_id, 'EMP001', 'מנהל צוות בכיר'),
        (demo_business_id, 'שרה', 'לוי', 'sara.levi@demo.com', '050-2345678', 'רחוב דיזנגוף 20, תל אביב', 'permanent', '2024-02-01', 40, demo_branch_1_id, 'EMP002', 'מפתחת תוכנה בכירה'),
        (demo_business_id, 'דוד', 'אברהם', 'david.abraham@demo.com', '050-3456789', 'רחוב הכרמל 5, חיפה', 'permanent', '2024-01-20', 40, demo_branch_2_id, 'EMP003', 'איש מכירות'),
        (demo_business_id, 'מיכל', 'ישראלי', 'michal.israeli@demo.com', '050-4567890', 'רחוב בן גוריון 12, חיפה', 'contractor', '2024-03-01', 25, demo_branch_2_id, 'EMP004', 'יועצת שיווק'),
        (demo_business_id, 'אבי', 'דוידוב', 'avi.davidov@demo.com', '050-5678901', 'רחוב קינג ג׳ורג׳ 8, תל אביב', 'temporary', '2024-04-01', 30, demo_branch_1_id, 'EMP005', 'סטודנט בהתמחות'),
        (demo_business_id, 'רחל', 'מזרחי', 'rachel.mizrahi@demo.com', '050-6789012', 'רחוב הנביאים 18, חיפה', 'youth', '2024-02-15', 25, demo_branch_2_id, 'EMP006', 'עובדת צעירה');
    
    -- הפעלת המודולים הקיימים במערכת לעסק הדמו
    INSERT INTO public.business_module_config (business_id, module_key, is_enabled, enabled_at)
    SELECT 
        demo_business_id,
        m.module_key,
        true,
        now()
    FROM public.modules_config m
    WHERE m.module_key IN ('employees', 'branches', 'integrations', 'settings', 'finance', 'crm', 'projects', 'orders', 'inventory', 'shifts');

    -- קבלת משתמש תקין מטבלת הפרופילים
    SELECT id INTO valid_user_id FROM public.profiles LIMIT 1;
    
    -- יצירת הערות לעובדים רק אם קיים משתמש תקין
    IF valid_user_id IS NOT NULL THEN
        INSERT INTO public.employee_notes (
            employee_id,
            business_id,
            created_by,
            note_type,
            content,
            is_warning
        )
        SELECT 
            e.id,
            demo_business_id,
            valid_user_id,
            'general',
            'הערה לדוגמה - עובד מצוין עם ביצועים גבוהים',
            false
        FROM public.employees e 
        WHERE e.business_id = demo_business_id 
        LIMIT 3;
    END IF;

END $$;
