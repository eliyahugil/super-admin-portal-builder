
import React from 'react';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';

export const Header: React.FC = () => {
  const { profile, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              פורטל Super Admin
            </h1>
          </div>
          
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="flex items-center space-x-2 space-x-reverse">
              <User className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-700">
                {profile?.full_name || profile?.email}
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {profile?.role === 'super_admin' ? 'מנהל על' : profile?.role}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="flex items-center space-x-2 space-x-reverse"
            >
              <LogOut className="h-4 w-4" />
              <span>התנתק</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
