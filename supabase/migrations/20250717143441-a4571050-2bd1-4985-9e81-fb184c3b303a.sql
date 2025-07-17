-- Update weekly tokens structure to support available/assigned shifts context
ALTER TABLE employee_weekly_tokens 
ADD COLUMN context_type TEXT DEFAULT 'submission' CHECK (context_type IN ('submission', 'available_shifts', 'assigned_shifts'));

-- Add column to track if shifts have been published for this week
ALTER TABLE employee_weekly_tokens 
ADD COLUMN shifts_published BOOLEAN DEFAULT false;

-- Create index for better performance
CREATE INDEX idx_employee_weekly_tokens_context ON employee_weekly_tokens(context_type, shifts_published);
CREATE INDEX idx_employee_weekly_tokens_week_dates ON employee_weekly_tokens(week_start_date, week_end_date);