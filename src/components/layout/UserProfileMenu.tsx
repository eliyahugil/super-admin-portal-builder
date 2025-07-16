import React, { useState, useMemo } from 'react';
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
import { Input } from '@/components/ui/input';
import { 
  User, 
  LogOut, 
  Building2, 
  Crown,
  ChevronDown,
  Check,
  Search
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
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  // Transform and filter businesses
  const filteredBusinesses = useMemo(() => {
    const allBusinesses = availableBusinesses?.map(ub => ({
      id: ub.business_id || ub.id,
      name: ub.business?.name || ub.name,
      description: ub.business?.description
    })) || [];

    if (!searchQuery.trim()) {
      return allBusinesses;
    }

    const query = searchQuery.toLowerCase().trim();
    return allBusinesses.filter(business => 
      business.name?.toLowerCase().includes(query) ||
      business.description?.toLowerCase().includes(query)
    );
  }, [availableBusinesses, searchQuery]);

  const handleBusinessChange = (businessId: string | null) => {
    console.log('🔄 UserProfileMenu: Changing business to:', businessId);
    
    try {
      setSelectedBusinessId(businessId);
      console.log('✅ UserProfileMenu: setSelectedBusinessId called successfully');
      
      // Clear search and close dropdown
      setSearchQuery('');
      setIsOpen(false);
      
      // Force page refresh after a short delay to ensure state is updated
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('❌ UserProfileMenu: Error calling setSelectedBusinessId:', error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    // Clear search when closing
    if (!newOpen) {
      setSearchQuery('');
    }
    setIsOpen(newOpen);
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
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
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
      
      <DropdownMenuContent align="end" className="w-80" style={{ direction: 'rtl' }}>
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
        {(isSuperAdmin || filteredBusinesses.length > 0) && (
          <>
            <DropdownMenuLabel className="text-right text-xs text-muted-foreground">
              בחר מצב עבודה
            </DropdownMenuLabel>
            
            {/* Search Box */}
            {(isSuperAdmin || availableBusinesses.length > 3) && (
              <div className="px-2 pb-2">
                <div className="relative">
                  <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="חפש עסק..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-9 text-right"
                    dir="rtl"
                  />
                </div>
                {searchQuery && filteredBusinesses.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    לא נמצאו עסקים התואמים לחיפוש
                  </p>
                )}
              </div>
            )}
            
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
            
            {/* Show businesses - limit to 10 results for performance */}
            {filteredBusinesses.slice(0, 10).map((business) => (
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
            
            {/* Show if there are more results */}
            {filteredBusinesses.length > 10 && (
              <div className="px-2 py-1 text-xs text-muted-foreground text-center">
                מוצגים 10 מתוך {filteredBusinesses.length} עסקים. שפר את החיפוש לתוצאות מדויקות יותר.
              </div>
            )}
            
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