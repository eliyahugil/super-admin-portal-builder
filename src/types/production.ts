// Products
export interface Product {
  id: string;
  business_id: string;
  name: string;
  product_code?: string;
  product_type: string;
  default_unit: string;
  shelf_life_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Raw Material Receipts
export interface RawMaterialReceipt {
  id: string;
  business_id: string;
  supplier_name: string;
  material_name: string;
  lot_code?: string;
  received_date: string;
  expiration_date?: string;
  quantity?: number;
  unit?: string;
  documents_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Production Batch (Updated)
export interface ProductionBatch {
  id: string;
  business_id: string;
  batch_number: string;
  product_name: string;
  product_code?: string;
  planned_quantity: number;
  actual_quantity?: number;
  unit: string;
  production_date: string;
  start_time?: string;
  end_time?: string;
  shift_type?: string;
  supervisor_id?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  production_line?: string;
  employee_in_charge?: string;
  raw_receipt_id?: string;
  raw_received_date?: string;
  raw_expiration_date?: string;
  sanitation_check: boolean;
  equipment_cleaned_at?: string;
  quality_check_passed: boolean;
  verified_by?: string;
  created_at: string;
  updated_at: string;
}

// Production Materials
export interface ProductionMaterial {
  id: string;
  business_id: string;
  batch_id: string;
  material_name: string;
  lot_code?: string;
  quantity?: number;
  unit?: string;
  notes?: string;
  created_at: string;
}

export interface RawMaterial {
  id: string;
  business_id: string;
  material_name: string;
  material_code?: string;
  supplier?: string;
  category?: string;
  unit: string;
  min_stock?: number;
  current_stock?: number;
  storage_temp_min?: number;
  storage_temp_max?: number;
  storage_location?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RawMaterialUsage {
  id: string;
  business_id: string;
  batch_id: string;
  material_id: string;
  quantity_used: number;
  lot_number?: string;
  expiry_date?: string;
  recorded_by?: string;
  created_at: string;
}

export interface QualityCheck {
  id: string;
  business_id: string;
  batch_id?: string;
  check_type: 'raw_material' | 'in_process' | 'finished_product';
  check_date: string;
  inspector_id?: string;
  product_name?: string;
  temperature?: number;
  ph_level?: number;
  appearance?: string;
  smell?: string;
  texture?: string;
  taste?: string;
  visual_inspection?: string;
  passed: boolean;
  failure_reason?: string;
  corrective_action?: string;
  notes?: string;
  created_at: string;
}

export interface CleaningLog {
  id: string;
  business_id: string;
  area_name: string;
  equipment_name?: string;
  cleaning_date: string;
  cleaned_by?: string;
  cleaning_type: 'regular' | 'deep' | 'sanitization';
  cleaning_products_used?: string;
  verification_performed: boolean;
  verified_by?: string;
  verification_time?: string;
  passed?: boolean;
  notes?: string;
  next_cleaning_due?: string;
  created_at: string;
}

export interface ProductionEquipment {
  id: string;
  business_id: string;
  equipment_name: string;
  equipment_code?: string;
  equipment_type?: string;
  location?: string;
  purchase_date?: string;
  last_maintenance_date?: string;
  next_maintenance_due?: string;
  status: 'operational' | 'maintenance' | 'broken';
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EquipmentMaintenance {
  id: string;
  business_id: string;
  equipment_id: string;
  maintenance_date: string;
  maintenance_type: 'preventive' | 'corrective' | 'calibration';
  performed_by?: string;
  technician_name?: string;
  description: string;
  parts_replaced?: string;
  cost?: number;
  next_maintenance_date?: string;
  created_at: string;
}
