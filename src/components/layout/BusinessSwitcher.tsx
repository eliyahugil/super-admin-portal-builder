
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, Check, ChevronDown, User, AlertCircle } from 'lucide-react';
import { useUserBusinesses } from '@/hooks/useUserBusinesses';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useAuth } from '@/components/auth/AuthContext';

export const BusinessSwitcher: React.FC = () => {
  const { profile, user } = useAuth();
  const { data: userBusinesses = [], isLoading } = useUserBusinesses();
  const { businessId, isSuperAdmin } = useCurrentBusiness();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  console.log('🏢 BusinessSwitcher - Current state:', {
    userBusinesses: userBusinesses.length,
    currentBusinessId: businessId,
    isSuperAdmin,
    isLoading
  });

  const handleBusinessSelect = (selectedBusinessId: string) => {
    console.log('🔄 Switching to business:', selectedBusinessId);
    navigate(`/business/${selectedBusinessId}/modules/employees`);
    setIsOpen(false);
  };

  const currentBusiness = userBusinesses.find(ub => ub.business_id === businessId);

  if (!profile || !user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-500">טוען עסקים...</span>
      </div>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 p-2 hover:bg-gray-100">
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentBusiness?.business.logo_url} />
            <AvatarFallback>
              {currentBusiness ? (
                <Building2 className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col items-start text-right">
            <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
              {profile.full_name || 'משתמש'}
            </span>
            <span className="text-xs text-gray-500 truncate max-w-[120px]">
              {currentBusiness?.business.name || (isSuperAdmin ? 'מנהל על' : 'אין עסק')}
            </span>
          </div>
          
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-64 text-right"
        style={{ direction: 'rtl' }}
      >
        <DropdownMenuLabel className="text-right">
          <div className="flex flex-col">
            <span className="font-medium">{profile.full_name || 'משתמש'}</span>
            <span className="text-xs text-gray-500 font-normal">{user.email}</span>
            {isSuperAdmin && (
              <span className="text-xs text-blue-600 font-medium mt-1">מנהל ראשי</span>
            )}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs text-gray-500 text-right">
          עסקים זמינים ({userBusinesses.length})
        </DropdownMenuLabel>
        
        {userBusinesses.length > 0 ? (
          userBusinesses.map((userBusiness) => (
            <DropdownMenuItem
              key={userBusiness.business_id}
              onClick={() => handleBusinessSelect(userBusiness.business_id)}
              className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userBusiness.business.logo_url} />
                  <AvatarFallback>
                    <Building2 className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col items-start">
                  <span className="font-medium text-sm">{userBusiness.business.name}</span>
                  <span className="text-xs text-gray-500">{userBusiness.role}</span>
                </div>
              </div>
              
              {userBusiness.business_id === businessId && (
                <Check className="h-4 w-4 text-green-600" />
              )}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled className="flex items-center gap-2 p-3">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <div className="flex flex-col text-right">
              <span className="text-sm text-gray-700">אין עסקים זמינים</span>
              <span className="text-xs text-gray-500">
                {isSuperAdmin ? 'טוען נתונים...' : 'פנה למנהל המערכת'}
              </span>
            </div>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
