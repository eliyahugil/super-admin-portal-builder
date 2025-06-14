
import type { User, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'super_admin' | 'business_admin' | 'business_user';
  business_id?: string | null;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, fullName?: string, phone?: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  isSuperAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
