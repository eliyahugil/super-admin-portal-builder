import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  User, 
  LogOut, 
  Building2, 
  Crown,
  ChevronDown,
  Check 
} from 'lucide-react';

export const UserProfileMenu: React.FC = () => {
  const { user, signOut } = useAuth();
  const { 
    businessId: selectedBusinessId, 
    setSelectedBusinessId, 
    isSuperAdmin, 
    availableBusinesses,
    businessName 
  } = useCurrentBusiness();
  
  const [isOpen, setIsOpen] = useState(false);
  
  // Transform availableBusinesses to match the expected format
  const businesses = availableBusinesses?.map(ub => ({
    id: ub.business_id || ub.id,
    name: ub.business?.name || ub.name,
    description: ub.business?.description
  })) || [];

  const handleBusinessChange = (businessId: string | null) => {
    console.log('🔄 UserProfileMenu: Changing business to:', businessId);
    
    try {
      setSelectedBusinessId(businessId);
      console.log('✅ UserProfileMenu: setSelectedBusinessId called successfully');
      
      // Force close dropdown
      setIsOpen(false);
      
      // Force page refresh after a short delay to ensure state is updated
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('❌ UserProfileMenu: Error calling setSelectedBusinessId:', error);
    }
  };

  const getDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'משתמש';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 h-auto p-2 hover:bg-muted/50"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="text-xs font-medium">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start">
            <div className="text-sm font-medium">{getDisplayName()}</div>
            {businessName && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {businessName}
              </div>
            )}
            {isSuperAdmin && !selectedBusinessId && (
              <div className="text-xs text-purple-600 flex items-center gap-1">
                <Crown className="h-3 w-3" />
                מנהל מערכת
              </div>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-72" style={{ direction: 'rtl' }}>
        <DropdownMenuLabel className="text-right">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Business Selection Section */}
        {(isSuperAdmin || businesses.length > 1) && (
          <>
            <DropdownMenuLabel className="text-right text-xs text-muted-foreground">
              בחר מצב עבודה
            </DropdownMenuLabel>
            
            {isSuperAdmin && (
              <DropdownMenuItem 
                onClick={() => handleBusinessChange(null)}
                className="text-right flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-purple-600" />
                  <span>מנהל מערכת ראשי</span>
                </div>
                {!selectedBusinessId && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </DropdownMenuItem>
            )}
            
            {businesses.map((business) => (
              <DropdownMenuItem
                key={business.id}
                onClick={() => handleBusinessChange(business.id)}
                className="text-right flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <div className="flex flex-col">
                    <span className="font-medium">{business.name}</span>
                    {business.description && (
                      <span className="text-xs text-muted-foreground">
                        {business.description}
                      </span>
                    )}
                  </div>
                </div>
                {selectedBusinessId === business.id && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* User Actions */}
        <DropdownMenuItem 
          onClick={signOut}
          className="text-right text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <LogOut className="h-4 w-4 ml-2" />
          יציאה מהמערכת
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};