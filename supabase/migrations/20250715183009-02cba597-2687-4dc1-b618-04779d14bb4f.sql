-- שדרוג מערכת סידור העבודה למערכת מתקדמת

-- 1. טבלת אילוצי עובדים (חופשות, העדפות זמנים)
CREATE TABLE IF NOT EXISTS public.employee_scheduling_constraints (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    constraint_type TEXT NOT NULL CHECK (constraint_type IN ('vacation', 'unavailable', 'preferred_times', 'max_hours_per_day', 'max_hours_per_week', 'min_rest_between_shifts')),
    start_date DATE,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    days_of_week INTEGER[], -- [0,1,2,3,4,5,6] for Sunday-Saturday
    value_numeric NUMERIC, -- for hours constraints
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5), -- 1=lowest, 5=highest
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- 2. טבלת כללי סידור לעסק
CREATE TABLE IF NOT EXISTS public.business_scheduling_rules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE, -- NULL = applies to all branches
    rule_type TEXT NOT NULL CHECK (rule_type IN ('opening_hours', 'min_employees_per_shift', 'max_employees_per_shift', 'required_roles', 'break_duration', 'overtime_rules')),
    shift_type TEXT CHECK (shift_type IN ('morning', 'evening', 'night')),
    days_of_week INTEGER[], -- [0,1,2,3,4,5,6] for Sunday-Saturday
    start_time TIME,
    end_time TIME,
    value_numeric NUMERIC,
    value_json JSONB, -- for complex rules like required roles
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- 3. טבלת תבניות סידור
CREATE TABLE IF NOT EXISTS public.scheduling_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    template_name TEXT NOT NULL,
    template_type TEXT NOT NULL CHECK (template_type IN ('weekly', 'monthly', 'seasonal')),
    description TEXT,
    template_data JSONB NOT NULL, -- structure of the template
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- 4. טבלת בקשות החלפת משמרות
CREATE TABLE IF NOT EXISTS public.shift_swap_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    target_employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE, -- NULL for open request
    original_shift_id UUID NOT NULL REFERENCES public.scheduled_shifts(id) ON DELETE CASCADE,
    proposed_shift_id UUID REFERENCES public.scheduled_shifts(id) ON DELETE CASCADE, -- NULL for shift release
    request_type TEXT NOT NULL CHECK (request_type IN ('swap', 'cover', 'release')) DEFAULT 'swap',
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')) DEFAULT 'pending',
    message TEXT,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. טבלת אירועי סידור (logs)
CREATE TABLE IF NOT EXISTS public.scheduling_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('auto_schedule_created', 'manual_schedule_created', 'shift_assigned', 'shift_swapped', 'constraint_violation', 'template_applied')),
    description TEXT NOT NULL,
    metadata JSONB,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error')) DEFAULT 'info',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- 6. טבלת הגדרות סידור אוטומטי
CREATE TABLE IF NOT EXISTS public.auto_scheduling_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE UNIQUE,
    algorithm_type TEXT NOT NULL CHECK (algorithm_type IN ('basic', 'advanced', 'ai_optimized')) DEFAULT 'basic',
    optimization_goals JSONB NOT NULL DEFAULT '{"priorities": ["coverage", "fairness", "cost"]}',
    auto_schedule_enabled BOOLEAN NOT NULL DEFAULT false,
    schedule_weeks_ahead INTEGER NOT NULL DEFAULT 2 CHECK (schedule_weeks_ahead >= 1 AND schedule_weeks_ahead <= 12),
    notification_preferences JSONB NOT NULL DEFAULT '{"notify_employees": true, "notify_managers": true}',
    conflict_resolution TEXT NOT NULL CHECK (conflict_resolution IN ('manual_review', 'auto_resolve', 'hybrid')) DEFAULT 'manual_review',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- הוספת אינדקסים לביצועים טובים יותר
CREATE INDEX IF NOT EXISTS idx_employee_scheduling_constraints_employee_business 
ON public.employee_scheduling_constraints (employee_id, business_id, is_active);

CREATE INDEX IF NOT EXISTS idx_employee_scheduling_constraints_dates 
ON public.employee_scheduling_constraints (start_date, end_date) WHERE start_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_business_scheduling_rules_business_branch 
ON public.business_scheduling_rules (business_id, branch_id, is_active);

CREATE INDEX IF NOT EXISTS idx_shift_swap_requests_status 
ON public.shift_swap_requests (status, created_at);

CREATE INDEX IF NOT EXISTS idx_scheduling_events_business_date 
ON public.scheduling_events (business_id, created_at DESC);

-- הפעלת RLS על הטבלאות החדשות
ALTER TABLE public.employee_scheduling_constraints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_scheduling_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduling_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduling_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_scheduling_settings ENABLE ROW LEVEL SECURITY;

-- מדיניות RLS לאילוצי עובדים
CREATE POLICY "Users can manage constraints for their business employees" 
ON public.employee_scheduling_constraints 
FOR ALL 
USING (business_id = ANY(public.get_user_business_ids()))
WITH CHECK (business_id = ANY(public.get_user_business_ids()));

-- מדיניות RLS לכללי סידור עסק
CREATE POLICY "Users can manage scheduling rules for their businesses" 
ON public.business_scheduling_rules 
FOR ALL 
USING (business_id = ANY(public.get_user_business_ids()))
WITH CHECK (business_id = ANY(public.get_user_business_ids()));

-- מדיניות RLS לתבניות סידור
CREATE POLICY "Users can manage scheduling templates for their businesses" 
ON public.scheduling_templates 
FOR ALL 
USING (business_id = ANY(public.get_user_business_ids()))
WITH CHECK (business_id = ANY(public.get_user_business_ids()));

-- מדיניות RLS לבקשות החלפת משמרות
CREATE POLICY "Users can view and manage shift swap requests for their business" 
ON public.shift_swap_requests 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.employees e 
        WHERE (e.id = requester_employee_id OR e.id = target_employee_id) 
        AND e.business_id = ANY(public.get_user_business_ids())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.employees e 
        WHERE e.id = requester_employee_id 
        AND e.business_id = ANY(public.get_user_business_ids())
    )
);

-- מדיניות RLS לאירועי סידור
CREATE POLICY "Users can view scheduling events for their businesses" 
ON public.scheduling_events 
FOR ALL 
USING (business_id = ANY(public.get_user_business_ids()))
WITH CHECK (business_id = ANY(public.get_user_business_ids()));

-- מדיניות RLS להגדרות סידור אוטומטי
CREATE POLICY "Users can manage auto scheduling settings for their businesses" 
ON public.auto_scheduling_settings 
FOR ALL 
USING (business_id = ANY(public.get_user_business_ids()))
WITH CHECK (business_id = ANY(public.get_user_business_ids()));

-- טריגרים לעדכון updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_employee_scheduling_constraints_updated_at
    BEFORE UPDATE ON public.employee_scheduling_constraints
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_scheduling_rules_updated_at
    BEFORE UPDATE ON public.business_scheduling_rules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduling_templates_updated_at
    BEFORE UPDATE ON public.scheduling_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shift_swap_requests_updated_at
    BEFORE UPDATE ON public.shift_swap_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_auto_scheduling_settings_updated_at
    BEFORE UPDATE ON public.auto_scheduling_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();