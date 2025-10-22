-- Create financial_transactions table
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'ILS',
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for financial_transactions
CREATE POLICY "Users can view their business financial transactions"
  ON public.financial_transactions FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM public.user_businesses WHERE user_id = auth.uid()
    )
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Business admins can insert financial transactions"
  ON public.financial_transactions FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT ub.business_id 
      FROM public.user_businesses ub
      WHERE ub.user_id = auth.uid() 
      AND ub.role IN ('business_admin', 'super_admin')
    )
  );

CREATE POLICY "Business admins can update their financial transactions"
  ON public.financial_transactions FOR UPDATE
  USING (
    business_id IN (
      SELECT ub.business_id 
      FROM public.user_businesses ub
      WHERE ub.user_id = auth.uid() 
      AND ub.role IN ('business_admin', 'super_admin')
    )
  );

CREATE POLICY "Business admins can delete their financial transactions"
  ON public.financial_transactions FOR DELETE
  USING (
    business_id IN (
      SELECT ub.business_id 
      FROM public.user_businesses ub
      WHERE ub.user_id = auth.uid() 
      AND ub.role IN ('business_admin', 'super_admin')
    )
  );

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
  start_date DATE,
  end_date DATE,
  budget NUMERIC(12, 2),
  actual_cost NUMERIC(12, 2) DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view their business projects"
  ON public.projects FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM public.user_businesses WHERE user_id = auth.uid()
    )
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Business admins can insert projects"
  ON public.projects FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT ub.business_id 
      FROM public.user_businesses ub
      WHERE ub.user_id = auth.uid() 
      AND ub.role IN ('business_admin', 'super_admin')
    )
  );

CREATE POLICY "Business admins can update their projects"
  ON public.projects FOR UPDATE
  USING (
    business_id IN (
      SELECT ub.business_id 
      FROM public.user_businesses ub
      WHERE ub.user_id = auth.uid() 
      AND ub.role IN ('business_admin', 'super_admin')
    )
  );

CREATE POLICY "Business admins can delete their projects"
  ON public.projects FOR DELETE
  USING (
    business_id IN (
      SELECT ub.business_id 
      FROM public.user_businesses ub
      WHERE ub.user_id = auth.uid() 
      AND ub.role IN ('business_admin', 'super_admin')
    )
  );

-- Create project_tasks table
CREATE TABLE IF NOT EXISTS public.project_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_tasks
CREATE POLICY "Users can view tasks of their business projects"
  ON public.project_tasks FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      WHERE p.business_id IN (
        SELECT business_id FROM public.user_businesses WHERE user_id = auth.uid()
      )
    )
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Business users can insert tasks"
  ON public.project_tasks FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM public.projects p
      WHERE p.business_id IN (
        SELECT ub.business_id 
        FROM public.user_businesses ub
        WHERE ub.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Business users can update tasks"
  ON public.project_tasks FOR UPDATE
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      WHERE p.business_id IN (
        SELECT ub.business_id 
        FROM public.user_businesses ub
        WHERE ub.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Business admins can delete tasks"
  ON public.project_tasks FOR DELETE
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      WHERE p.business_id IN (
        SELECT ub.business_id 
        FROM public.user_businesses ub
        WHERE ub.user_id = auth.uid() 
        AND ub.role IN ('business_admin', 'super_admin')
      )
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_financial_transactions_business_id ON public.financial_transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON public.financial_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_projects_business_id ON public.projects(business_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON public.project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned_to ON public.project_tasks(assigned_to);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_financial_transactions_updated_at
  BEFORE UPDATE ON public.financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at
  BEFORE UPDATE ON public.project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();