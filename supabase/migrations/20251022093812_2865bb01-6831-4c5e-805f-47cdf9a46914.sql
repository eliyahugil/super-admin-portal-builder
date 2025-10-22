-- Production Log System for Food Manufacturing Plants

-- Production Batches (אצוות ייצור)
CREATE TABLE IF NOT EXISTS public.production_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  batch_number TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_code TEXT,
  planned_quantity DECIMAL(10,2) NOT NULL,
  actual_quantity DECIMAL(10,2),
  unit TEXT NOT NULL, -- kg, liters, units, etc.
  production_date DATE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  shift_type TEXT, -- morning, evening, night
  supervisor_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'planned', -- planned, in_progress, completed, cancelled
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, batch_number)
);

-- Raw Materials Tracking (מעקב חומרי גלם)
CREATE TABLE IF NOT EXISTS public.raw_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  material_name TEXT NOT NULL,
  material_code TEXT,
  supplier TEXT,
  category TEXT, -- dairy, meat, vegetables, packaging, etc.
  unit TEXT NOT NULL,
  min_stock DECIMAL(10,2),
  current_stock DECIMAL(10,2) DEFAULT 0,
  storage_temp_min DECIMAL(5,2),
  storage_temp_max DECIMAL(5,2),
  storage_location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Raw Material Usage (שימוש בחומרי גלם)
CREATE TABLE IF NOT EXISTS public.raw_material_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES public.production_batches(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.raw_materials(id) ON DELETE CASCADE,
  quantity_used DECIMAL(10,2) NOT NULL,
  lot_number TEXT,
  expiry_date DATE,
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quality Control Checks (בדיקות בקרת איכות)
CREATE TABLE IF NOT EXISTS public.quality_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.production_batches(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL, -- raw_material, in_process, finished_product
  check_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  inspector_id UUID REFERENCES auth.users(id),
  product_name TEXT,
  temperature DECIMAL(5,2),
  ph_level DECIMAL(4,2),
  appearance TEXT,
  smell TEXT,
  texture TEXT,
  taste TEXT,
  visual_inspection TEXT,
  passed BOOLEAN NOT NULL,
  failure_reason TEXT,
  corrective_action TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cleaning & Hygiene Log (יומן ניקיון והיגיינה)
CREATE TABLE IF NOT EXISTS public.cleaning_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  area_name TEXT NOT NULL, -- production floor, storage, equipment, etc.
  equipment_name TEXT,
  cleaning_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cleaned_by UUID REFERENCES auth.users(id),
  cleaning_type TEXT NOT NULL, -- regular, deep, sanitization
  cleaning_products_used TEXT,
  verification_performed BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verification_time TIMESTAMP WITH TIME ZONE,
  passed BOOLEAN,
  notes TEXT,
  next_cleaning_due DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Production Equipment (ציוד ייצור)
CREATE TABLE IF NOT EXISTS public.production_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  equipment_name TEXT NOT NULL,
  equipment_code TEXT,
  equipment_type TEXT, -- mixer, oven, packaging, etc.
  location TEXT,
  purchase_date DATE,
  last_maintenance_date DATE,
  next_maintenance_due DATE,
  status TEXT DEFAULT 'operational', -- operational, maintenance, broken
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Equipment Maintenance Log (יומן תחזוקת ציוד)
CREATE TABLE IF NOT EXISTS public.equipment_maintenance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES public.production_equipment(id) ON DELETE CASCADE,
  maintenance_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  maintenance_type TEXT NOT NULL, -- preventive, corrective, calibration
  performed_by TEXT,
  technician_name TEXT,
  description TEXT NOT NULL,
  parts_replaced TEXT,
  cost DECIMAL(10,2),
  next_maintenance_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_material_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_maintenance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for production_batches
CREATE POLICY "Users can view batches in their business"
  ON public.production_batches FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Business admins can manage batches"
  ON public.production_batches FOR ALL
  USING (
    business_id IN (
      SELECT business_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('business_admin', 'super_admin')
    )
  );

-- RLS Policies for raw_materials
CREATE POLICY "Users can view materials in their business"
  ON public.raw_materials FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Business admins can manage materials"
  ON public.raw_materials FOR ALL
  USING (
    business_id IN (
      SELECT business_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('business_admin', 'super_admin')
    )
  );

-- RLS Policies for raw_material_usage
CREATE POLICY "Users can view material usage in their business"
  ON public.raw_material_usage FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can record material usage"
  ON public.raw_material_usage FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT business_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for quality_checks
CREATE POLICY "Users can view quality checks in their business"
  ON public.quality_checks FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create quality checks"
  ON public.quality_checks FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT business_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Business admins can manage quality checks"
  ON public.quality_checks FOR ALL
  USING (
    business_id IN (
      SELECT business_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('business_admin', 'super_admin')
    )
  );

-- RLS Policies for cleaning_logs
CREATE POLICY "Users can view cleaning logs in their business"
  ON public.cleaning_logs FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create cleaning logs"
  ON public.cleaning_logs FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT business_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Business admins can manage cleaning logs"
  ON public.cleaning_logs FOR ALL
  USING (
    business_id IN (
      SELECT business_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('business_admin', 'super_admin')
    )
  );

-- RLS Policies for production_equipment
CREATE POLICY "Users can view equipment in their business"
  ON public.production_equipment FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Business admins can manage equipment"
  ON public.production_equipment FOR ALL
  USING (
    business_id IN (
      SELECT business_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('business_admin', 'super_admin')
    )
  );

-- RLS Policies for equipment_maintenance
CREATE POLICY "Users can view maintenance logs in their business"
  ON public.equipment_maintenance FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create maintenance logs"
  ON public.equipment_maintenance FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT business_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Business admins can manage maintenance logs"
  ON public.equipment_maintenance FOR ALL
  USING (
    business_id IN (
      SELECT business_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('business_admin', 'super_admin')
    )
  );

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.set_production_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_production_batches_updated_at
  BEFORE UPDATE ON public.production_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.set_production_updated_at();

CREATE TRIGGER update_raw_materials_updated_at
  BEFORE UPDATE ON public.raw_materials
  FOR EACH ROW
  EXECUTE FUNCTION public.set_production_updated_at();

CREATE TRIGGER update_production_equipment_updated_at
  BEFORE UPDATE ON public.production_equipment
  FOR EACH ROW
  EXECUTE FUNCTION public.set_production_updated_at();

-- Indexes for performance
CREATE INDEX idx_production_batches_business ON public.production_batches(business_id);
CREATE INDEX idx_production_batches_date ON public.production_batches(production_date);
CREATE INDEX idx_production_batches_status ON public.production_batches(status);
CREATE INDEX idx_raw_materials_business ON public.raw_materials(business_id);
CREATE INDEX idx_raw_material_usage_batch ON public.raw_material_usage(batch_id);
CREATE INDEX idx_quality_checks_business ON public.quality_checks(business_id);
CREATE INDEX idx_quality_checks_batch ON public.quality_checks(batch_id);
CREATE INDEX idx_cleaning_logs_business ON public.cleaning_logs(business_id);
CREATE INDEX idx_cleaning_logs_date ON public.cleaning_logs(cleaning_date);
CREATE INDEX idx_equipment_business ON public.production_equipment(business_id);
CREATE INDEX idx_equipment_maintenance_equipment ON public.equipment_maintenance(equipment_id);