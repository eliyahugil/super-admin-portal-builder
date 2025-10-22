-- Products table for production management
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  product_code TEXT,
  product_type TEXT NOT NULL,
  default_unit TEXT NOT NULL DEFAULT 'יחידות',
  shelf_life_days INTEGER NOT NULL DEFAULT 3,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, product_code)
);

-- Raw Material Receipts (קבלות חומרי גלם)
CREATE TABLE IF NOT EXISTS public.raw_material_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  supplier_name TEXT NOT NULL,
  material_name TEXT NOT NULL,
  lot_code TEXT,
  received_date DATE NOT NULL,
  expiration_date DATE,
  quantity DECIMAL(12,3),
  unit TEXT,
  documents_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Production Materials (רכיבי חומרי גלם לאצווה)
CREATE TABLE IF NOT EXISTS public.production_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES public.production_batches(id) ON DELETE CASCADE,
  material_name TEXT NOT NULL,
  lot_code TEXT,
  quantity DECIMAL(12,3),
  unit TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update production_batches with additional fields
ALTER TABLE public.production_batches
  ADD COLUMN IF NOT EXISTS product_code TEXT,
  ADD COLUMN IF NOT EXISTS production_line TEXT,
  ADD COLUMN IF NOT EXISTS employee_in_charge UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS raw_receipt_id UUID REFERENCES public.raw_material_receipts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS raw_received_date DATE,
  ADD COLUMN IF NOT EXISTS raw_expiration_date DATE,
  ADD COLUMN IF NOT EXISTS sanitation_check BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS equipment_cleaned_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS quality_check_passed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_material_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_materials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
CREATE POLICY "Users can view products in their business"
  ON public.products FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Business admins can manage products"
  ON public.products FOR ALL
  USING (
    business_id IN (
      SELECT business_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('business_admin', 'super_admin')
    )
  );

-- RLS Policies for raw_material_receipts
CREATE POLICY "Users can view receipts in their business"
  ON public.raw_material_receipts FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Business admins can manage receipts"
  ON public.raw_material_receipts FOR ALL
  USING (
    business_id IN (
      SELECT business_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('business_admin', 'super_admin')
    )
  );

-- RLS Policies for production_materials
CREATE POLICY "Users can view production materials in their business"
  ON public.production_materials FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage production materials"
  ON public.production_materials FOR ALL
  USING (
    business_id IN (
      SELECT business_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.set_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_products_updated_at();

CREATE TRIGGER update_raw_receipts_updated_at
  BEFORE UPDATE ON public.raw_material_receipts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_production_updated_at();

-- Indexes
CREATE INDEX idx_products_business ON public.products(business_id);
CREATE INDEX idx_products_type ON public.products(product_type);
CREATE INDEX idx_raw_receipts_business ON public.raw_material_receipts(business_id);
CREATE INDEX idx_raw_receipts_date ON public.raw_material_receipts(received_date);
CREATE INDEX idx_production_materials_batch ON public.production_materials(batch_id);