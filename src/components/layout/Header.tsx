
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useBusiness } from '@/hooks/useBusiness';
import { useAuth } from '@/components/auth/AuthContext';

export const Header: React.FC = () => {
  const { business, isSuperAdmin } = useBusiness();
  const { profile, user, loading } = useAuth();

  console.log('🎯 Header render - Auth state:', {
    hasUser: !!user,
    hasProfile: !!profile,
    loading,
    profileRole: profile?.role,
    profileName: profile?.full_name,
    profileEmail: profile?.email,
    isSuperAdmin
  });

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold text-gray-900">
          {business?.name || 'מערכת ניהול'}
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        {loading ? (
          <span className="text-sm text-gray-400">טוען...</span>
        ) : profile ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {profile.full_name || 'משתמש'}
            </span>
            <span className="text-sm text-gray-500">
              ({profile.role === 'super_admin' ? 'מנהל על' : 'משתמש עסקי'})
            </span>
          </div>
        ) : (
          <span className="text-sm text-red-600">אין פרופיל</span>
        )}
      </div>
    </header>
  );
};
