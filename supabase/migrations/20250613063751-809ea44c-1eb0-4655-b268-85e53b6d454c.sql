
-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  company TEXT,
  contact_person TEXT,
  customer_type TEXT NOT NULL DEFAULT 'individual' CHECK (customer_type IN ('individual', 'business')),
  tax_id TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer_agreements table
CREATE TABLE public.customer_agreements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'service' CHECK (type IN ('service', 'purchase', 'rental', 'other')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'signed', 'expired')),
  valid_from DATE,
  valid_until DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on both tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_agreements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for customers table
CREATE POLICY "Users can view customers of their business" 
  ON public.customers 
  FOR SELECT 
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create customers for their business" 
  ON public.customers 
  FOR INSERT 
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update customers of their business" 
  ON public.customers 
  FOR UPDATE 
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete customers of their business" 
  ON public.customers 
  FOR DELETE 
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

-- Create RLS policies for customer_agreements table
CREATE POLICY "Users can view agreements of their business" 
  ON public.customer_agreements 
  FOR SELECT 
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create agreements for their business" 
  ON public.customer_agreements 
  FOR INSERT 
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update agreements of their business" 
  ON public.customer_agreements 
  FOR UPDATE 
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete agreements of their business" 
  ON public.customer_agreements 
  FOR DELETE 
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_customers_business_id ON public.customers(business_id);
CREATE INDEX idx_customers_email ON public.customers(email);
CREATE INDEX idx_customer_agreements_business_id ON public.customer_agreements(business_id);
CREATE INDEX idx_customer_agreements_customer_id ON public.customer_agreements(customer_id);
