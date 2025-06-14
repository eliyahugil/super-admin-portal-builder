
import type { User, Session } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any;
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
