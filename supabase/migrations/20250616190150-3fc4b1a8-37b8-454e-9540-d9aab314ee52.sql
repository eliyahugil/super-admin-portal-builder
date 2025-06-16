
-- יצירת טבלת קבוצות צ'אט
CREATE TABLE public.employee_chat_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  group_type TEXT NOT NULL DEFAULT 'general' CHECK (group_type IN ('general', 'custom', 'department'))
);

-- יצירת טבלת חברות בקבוצות
CREATE TABLE public.employee_chat_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES employee_chat_groups(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES profiles(id),
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_admin BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(group_id, employee_id)
);

-- עדכון טבלת הודעות הצ'אט להוסיף תמיכה בקבוצות
ALTER TABLE public.employee_chat_messages 
ADD COLUMN group_id UUID REFERENCES employee_chat_groups(id) ON DELETE CASCADE,
ADD COLUMN message_type TEXT NOT NULL DEFAULT 'direct' CHECK (message_type IN ('direct', 'group'));

-- יצירת אינדקסים לביצועים טובים יותר
CREATE INDEX idx_employee_chat_groups_business_id ON public.employee_chat_groups(business_id);
CREATE INDEX idx_employee_chat_group_members_group_id ON public.employee_chat_group_members(group_id);
CREATE INDEX idx_employee_chat_group_members_employee_id ON public.employee_chat_group_members(employee_id);
CREATE INDEX idx_employee_chat_messages_group_id ON public.employee_chat_messages(group_id);

-- הפעלת RLS על הטבלאות החדשות
ALTER TABLE public.employee_chat_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_chat_group_members ENABLE ROW LEVEL SECURITY;

-- מדיניות RLS לקבוצות צ'אט
CREATE POLICY "Enable read access for business users and super admins" 
  ON public.employee_chat_groups 
  FOR SELECT 
  USING (
    -- סופר אדמין יכול לראות הכל
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
    OR
    -- משתמשי עסק יכולים לראות קבוצות מהעסק שלהם
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.business_id = employee_chat_groups.business_id
    )
  );

CREATE POLICY "Enable insert for business users and super admins" 
  ON public.employee_chat_groups 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = created_by AND
    (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'super_admin'
      )
      OR
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.business_id = employee_chat_groups.business_id
      )
    )
  );

-- מדיניות RLS לחברות בקבוצות
CREATE POLICY "Enable read access for group members" 
  ON public.employee_chat_group_members 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.employee_chat_groups g
      JOIN public.profiles p ON p.business_id = g.business_id
      WHERE g.id = employee_chat_group_members.group_id AND p.id = auth.uid()
    )
  );

CREATE POLICY "Enable insert for business users" 
  ON public.employee_chat_group_members 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = added_by AND
    EXISTS (
      SELECT 1 FROM public.employee_chat_groups g
      JOIN public.profiles p ON p.business_id = g.business_id
      WHERE g.id = employee_chat_group_members.group_id AND p.id = auth.uid()
    )
  );

-- עדכון מדיניות RLS של הודעות לתמיכה בקבוצות
DROP POLICY IF EXISTS "Enable read access for business users and super admins" ON public.employee_chat_messages;

CREATE POLICY "Enable read access for business users and super admins" 
  ON public.employee_chat_messages 
  FOR SELECT 
  USING (
    -- סופר אדמין יכול לראות הכל
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
    OR
    -- הודעות ישירות - כמו קודם
    (message_type = 'direct' AND EXISTS (
      SELECT 1 FROM public.employees e
      JOIN public.profiles p ON p.business_id = e.business_id
      WHERE e.id = employee_chat_messages.employee_id 
        AND p.id = auth.uid()
        AND p.business_id IS NOT NULL
    ))
    OR
    -- הודעות קבוצתיות - רק לחברי הקבוצה
    (message_type = 'group' AND EXISTS (
      SELECT 1 FROM public.employee_chat_group_members gm
      JOIN public.employees e ON e.id = gm.employee_id
      JOIN public.profiles p ON p.business_id = e.business_id
      WHERE gm.group_id = employee_chat_messages.group_id 
        AND p.id = auth.uid()
    ))
  );

-- יצירת קבוצה כללית לכל עסק עם עובדים קיימים
DO $$
DECLARE
    business_record RECORD;
    general_group_id UUID;
    employee_record RECORD;
    admin_user_id UUID;
BEGIN
    -- עבור כל עסק שיש לו עובדים
    FOR business_record IN 
        SELECT DISTINCT b.id as business_id, b.name as business_name
        FROM public.businesses b
        WHERE EXISTS (
            SELECT 1 FROM public.employees e 
            WHERE e.business_id = b.id AND e.is_active = true
        )
    LOOP
        -- מצא משתמש אדמין לעסק זה
        SELECT p.id INTO admin_user_id
        FROM public.profiles p
        WHERE p.business_id = business_record.business_id 
          AND p.role IN ('business_admin', 'super_admin')
        LIMIT 1;
        
        -- אם אין אדמין, קח סופר אדמין
        IF admin_user_id IS NULL THEN
            SELECT p.id INTO admin_user_id
            FROM public.profiles p
            WHERE p.role = 'super_admin'
            LIMIT 1;
        END IF;
        
        -- אם עדיין אין משתמש, דלג
        IF admin_user_id IS NULL THEN
            CONTINUE;
        END IF;
        
        -- צור קבוצה כללית
        INSERT INTO public.employee_chat_groups (
            business_id, 
            name, 
            description, 
            created_by, 
            group_type
        ) VALUES (
            business_record.business_id,
            'קבוצת ' || business_record.business_name,
            'קבוצה כללית לכל העובדים',
            admin_user_id,
            'general'
        ) RETURNING id INTO general_group_id;
        
        -- הוסף את כל העובדים הפעילים לקבוצה
        FOR employee_record IN 
            SELECT id FROM public.employees 
            WHERE business_id = business_record.business_id AND is_active = true
        LOOP
            INSERT INTO public.employee_chat_group_members (
                group_id, 
                employee_id, 
                added_by, 
                is_admin
            ) VALUES (
                general_group_id,
                employee_record.id,
                admin_user_id,
                false
            );
        END LOOP;
        
    END LOOP;
END $$;
