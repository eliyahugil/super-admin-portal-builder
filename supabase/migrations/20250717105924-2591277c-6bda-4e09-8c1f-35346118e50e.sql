-- הוספת שדות לעובדים לניהול הגשת משמרות
ALTER TABLE public.employees 
ADD COLUMN shift_submission_quota INTEGER DEFAULT 3,
ADD COLUMN preferred_shift_time TEXT DEFAULT 'any' CHECK (preferred_shift_time IN ('morning', 'evening', 'night', 'any')),
ADD COLUMN can_choose_unassigned_shifts BOOLEAN DEFAULT true,
ADD COLUMN submission_notes TEXT;

-- יצירת טבלה למשמרות זמינות לבחירה
CREATE TABLE IF NOT EXISTS public.available_shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  shift_name TEXT NOT NULL,
  shift_type TEXT NOT NULL CHECK (shift_type IN ('morning', 'evening', 'night')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  required_employees INTEGER DEFAULT 1,
  current_assignments INTEGER DEFAULT 0,
  is_open_for_unassigned BOOLEAN DEFAULT false,
  branch_id UUID REFERENCES public.branches(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- הפעלת RLS
ALTER TABLE public.available_shifts ENABLE ROW LEVEL SECURITY;

-- יצירת מדיניות RLS
CREATE POLICY "Users can manage available shifts for their businesses"
ON public.available_shifts
FOR ALL
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

-- יצירת טבלה לבחירות משמרות של עובדים
CREATE TABLE IF NOT EXISTS public.employee_shift_choices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  available_shift_id UUID NOT NULL REFERENCES public.available_shifts(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  choice_type TEXT NOT NULL CHECK (choice_type IN ('regular', 'unassigned_request')) DEFAULT 'regular',
  preference_level INTEGER DEFAULT 1 CHECK (preference_level >= 1 AND preference_level <= 3),
  notes TEXT,
  is_approved BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, available_shift_id, week_start_date)
);

-- הפעלת RLS
ALTER TABLE public.employee_shift_choices ENABLE ROW LEVEL SECURITY;

-- יצירת מדיניות RLS
CREATE POLICY "Users can manage shift choices for their business employees"
ON public.employee_shift_choices
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.employees e 
  WHERE e.id = employee_shift_choices.employee_id 
  AND e.business_id = ANY (get_user_business_ids())
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.employees e 
  WHERE e.id = employee_shift_choices.employee_id 
  AND e.business_id = ANY (get_user_business_ids())
));

-- הוספת טריגר לעדכון updated_at
CREATE TRIGGER update_available_shifts_updated_at
BEFORE UPDATE ON public.available_shifts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_shift_choices_updated_at
BEFORE UPDATE ON public.employee_shift_choices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();