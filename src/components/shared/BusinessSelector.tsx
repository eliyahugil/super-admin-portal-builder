
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
  const { businessId: selectedBusinessId, setSelectedBusinessId } = useCurrentBusiness();

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);

  const handleBusinessChange = (businessId: string | null) => {
    console.log('🔄 BusinessSelector: Changing business to:', businessId);
    setSelectedBusinessId(businessId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={isLoading}
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-500" />
            <span className="truncate">
              {selectedBusiness ? selectedBusiness.name : placeholder}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="חפש עסק..." className="h-9" />
          <CommandList>
            <CommandEmpty>לא נמצאו עסקים</CommandEmpty>
            <CommandGroup>
              {showAllOption && (
                <CommandItem
                  value=""
                  onSelect={() => handleBusinessChange(null)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      !selectedBusinessId ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="text-gray-500">-- כל העסקים --</span>
                </CommandItem>
              )}
              {businesses.map((business) => (
                <CommandItem
                  key={business.id}
                  value={business.name}
                  onSelect={() => handleBusinessChange(business.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedBusinessId === business.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span>{business.name}</span>
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
