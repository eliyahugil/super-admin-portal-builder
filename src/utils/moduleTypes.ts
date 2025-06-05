
// Module type definitions to avoid complex Supabase type recursion
export interface SimpleProfile {
  role: string;
}

export interface SimpleBusiness {
  id: string;
}

export interface SimpleModule {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  route?: string;
  is_custom: boolean;
  is_active: boolean;
  customer_number?: number;
}

// Simple row types for database operations
export interface ProfileRow {
  id: string;
  role: string;
}

export interface BusinessRow {
  id: string;
  owner_id: string;
}

export interface ModuleRow {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  route?: string;
  is_custom: boolean;
  is_active: boolean;
  customer_number?: number;
}

export interface BusinessModuleRow {
  id: string;
  business_id: string;
  module_id: string;
}

export interface SubModuleRow {
  id: string;
  module_id: string;
  name: string;
  description?: string;
  route: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
}

export interface CustomField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  options?: string[];
}

export interface SubModule {
  id: string;
  name: string;
  description?: string;
  route: string;
  icon?: string;
  display_order: number;
}

export interface ModuleCreationResult {
  success: boolean;
  moduleId?: string;
  error?: string;
}

export interface ModuleRouteInfo {
  moduleRoute: string | null;
  subModule: string | null;
  isValid: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}
