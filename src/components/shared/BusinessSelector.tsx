
import React, { useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBusinessesData } from '@/hooks/useRealData';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

interface BusinessSelectorProps {
  placeholder?: string;
  className?: string;
  showAllOption?: boolean;
}

export const BusinessSelector: React.FC<BusinessSelectorProps> = ({
  placeholder = "בחר עסק...",
  className,
  showAllOption = false
}) => {
  const [open, setOpen] = useState(false);
  const { data: businesses = [], isLoading } = useBusinessesData();
  const { businessId: selectedBusinessId, setSelectedBusinessId, isSuperAdmin } = useCurrentBusiness();

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);

  const handleBusinessChange = (businessId: string | null) => {
    console.log('🔄 BusinessSelector: Changing business to:', businessId);
    setSelectedBusinessId(businessId);
    setOpen(false);
  };

  const getDisplayText = () => {
    if (selectedBusiness) {
      return `🏢 ${selectedBusiness.name}`;
    }
    if (isSuperAdmin && !selectedBusinessId) {
      return '👑 מנהל מערכת ראשי';
    }
    return placeholder;
  };

  const getDisplayColor = () => {
    if (selectedBusiness) {
      return 'text-blue-700';
    }
    if (isSuperAdmin && !selectedBusinessId) {
      return 'text-purple-700';
    }
    return 'text-gray-500';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between border-2 hover:border-blue-300 transition-all duration-200",
            selectedBusiness ? "border-blue-200 bg-blue-50" : 
            (isSuperAdmin && !selectedBusinessId) ? "border-purple-200 bg-purple-50" : "border-gray-200",
            className
          )}
          disabled={isLoading}
        >
          <div className="flex items-center gap-2">
            <Building2 className={cn("h-4 w-4", getDisplayColor())} />
            <span className={cn("truncate font-medium", getDisplayColor())}>
              {getDisplayText()}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 shadow-lg border-2" align="start">
        <Command>
          <CommandInput placeholder="חפש עסק..." className="h-9" />
          <CommandList>
            <CommandEmpty>לא נמצאו עסקים</CommandEmpty>
            <CommandGroup>
              {showAllOption && (
                <CommandItem
                  value=""
                  onSelect={() => handleBusinessChange(null)}
                  className="text-purple-700 hover:bg-purple-50"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      !selectedBusinessId ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">👑</span>
                    </div>
                    <span className="font-medium">מנהל מערכת ראשי</span>
                  </div>
                </CommandItem>
              )}
              {businesses.map((business) => (
                <CommandItem
                  key={business.id}
                  value={business.name}
                  onSelect={() => handleBusinessChange(business.id)}
                  className="hover:bg-blue-50"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedBusinessId === business.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                      <Building2 className="h-3 w-3 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{business.name}</span>
                      {business.description && (
                        <span className="text-xs text-gray-500 truncate max-w-48">
                          {business.description}
                        </span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
