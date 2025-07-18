-- Add birth_date column to employees table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='employees' AND column_name='birth_date') THEN
        ALTER TABLE public.employees ADD COLUMN birth_date DATE;
    END IF;
END $$;

-- Create a table for birthday notifications
CREATE TABLE IF NOT EXISTS public.birthday_notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    notification_date DATE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on birthday_notifications
ALTER TABLE public.birthday_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for birthday_notifications
CREATE POLICY "Users can view birthday notifications for their business employees" 
ON public.birthday_notifications 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.employees e
        WHERE e.id = birthday_notifications.employee_id
        AND e.business_id = ANY (get_user_business_ids())
    )
);

CREATE POLICY "System can insert birthday notifications" 
ON public.birthday_notifications 
FOR INSERT 
WITH CHECK (true);

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_birthday_notifications_employee_id 
ON public.birthday_notifications(employee_id);

CREATE INDEX IF NOT EXISTS idx_birthday_notifications_date 
ON public.birthday_notifications(notification_date);

-- Create index on employees birth_date for birthday queries
CREATE INDEX IF NOT EXISTS idx_employees_birth_date 
ON public.employees(birth_date) WHERE birth_date IS NOT NULL;