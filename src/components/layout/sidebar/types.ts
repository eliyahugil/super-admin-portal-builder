
export interface MenuItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresSuperAdmin?: boolean;
  moduleKey?: string;
  category?: string;
  allowedRoles?: Array<'super_admin' | 'business_admin' | 'business_user'>;
  subItems?: {
    path: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    moduleKey?: string;
    allowedRoles?: Array<'super_admin' | 'business_admin' | 'business_user'>;
  }[];
}
