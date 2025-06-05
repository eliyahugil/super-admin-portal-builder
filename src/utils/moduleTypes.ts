
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

export interface CustomField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  options?: string[];
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
