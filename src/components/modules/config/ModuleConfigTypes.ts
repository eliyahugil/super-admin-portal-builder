
export interface ModuleConfig {
  id: string;
  module_key: string;
  module_name: string;
  description: string | null;
  route_pattern: string;
  icon: string;
  category: string;
  is_core_module: boolean;
  requires_integration: boolean;
  integration_type: string | null;
  default_visible: boolean;
  enabled_by_superadmin: boolean;
  minimum_role: string;
  display_order: number;
  config_schema: any;
  permissions_required: string[];
  created_at: string;
  updated_at: string;
}

export interface BusinessModuleConfig {
  id: string;
  business_id: string;
  module_key: string;
  is_enabled: boolean;
  custom_config: any;
  custom_permissions: string[];
  enabled_by: string | null;
  enabled_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ModuleCategory = 'core' | 'integration' | 'management' | 'admin' | 'general';

export interface ModuleRoute {
  businessId?: string;
  route: string;
}
