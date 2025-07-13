-- Create CRM leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  source TEXT DEFAULT 'manual',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  lead_value DECIMAL(10,2),
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  notes TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  last_contact_date TIMESTAMP WITH TIME ZONE,
  next_follow_up_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create CRM opportunities table
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  value DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ILS',
  stage TEXT DEFAULT 'qualification' CHECK (stage IN ('qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  actual_close_date DATE,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create CRM activities table for tracking interactions
CREATE TABLE IF NOT EXISTS public.crm_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('call', 'email', 'meeting', 'note', 'task', 'follow_up')),
  title TEXT NOT NULL,
  description TEXT,
  activity_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for leads
CREATE POLICY "Users can view leads from their business" ON public.leads
  FOR SELECT USING (business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can create leads for their business" ON public.leads
  FOR INSERT WITH CHECK (business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can update leads from their business" ON public.leads
  FOR UPDATE USING (business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can delete leads from their business" ON public.leads
  FOR DELETE USING (business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  ));

-- Create RLS policies for opportunities
CREATE POLICY "Users can view opportunities from their business" ON public.opportunities
  FOR SELECT USING (business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can create opportunities for their business" ON public.opportunities
  FOR INSERT WITH CHECK (business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can update opportunities from their business" ON public.opportunities
  FOR UPDATE USING (business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can delete opportunities from their business" ON public.opportunities
  FOR DELETE USING (business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  ));

-- Create RLS policies for CRM activities
CREATE POLICY "Users can view CRM activities from their business" ON public.crm_activities
  FOR SELECT USING (business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can create CRM activities for their business" ON public.crm_activities
  FOR INSERT WITH CHECK (business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can update CRM activities from their business" ON public.crm_activities
  FOR UPDATE USING (business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can delete CRM activities from their business" ON public.crm_activities
  FOR DELETE USING (business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_business_id ON public.leads(business_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_opportunities_business_id ON public.opportunities(business_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON public.opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_crm_activities_business_id ON public.crm_activities(business_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_lead_id ON public.crm_activities(lead_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_activities_updated_at
  BEFORE UPDATE ON public.crm_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();