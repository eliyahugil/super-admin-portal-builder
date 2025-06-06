
import React, { useState, useEffect, useRef } from 'react';
import { Input } from './input';
import { Label } from './label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import { Check, ChevronsUpDown, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { googleMapsService, type PlaceAutocompleteResult } from '@/services/GoogleMapsService';
import { useToast } from '@/hooks/use-toast';

interface AddressData {
  formatted_address: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface AddressAutocompleteProps {
  label?: string;
  placeholder?: string;
  value?: AddressData | null;
  onChange?: (address: AddressData | null) => void;
  required?: boolean;
  className?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  label = 'כתובת',
  placeholder = 'הקלד כתובת...',
  value,
  onChange,
  required = false,
  className
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value?.formatted_address || '');
  const [predictions, setPredictions] = useState<PlaceAutocompleteResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  useEffect(() => {
    if (value) {
      setInputValue(value.formatted_address);
    }
  }, [value]);

  const searchPredictions = async (input: string) => {
    if (input.length < 3) {
      setPredictions([]);
      return;
    }

    try {
      setIsLoading(true);
      const results = await googleMapsService.getPlaceAutocomplete(input);
      setPredictions(results);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לטעון הצעות כתובת. אנא בדוק את הגדרות Google Maps.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for search
    timeoutRef.current = setTimeout(() => {
      searchPredictions(newValue);
    }, 300);
  };

  const handleSelectPlace = async (prediction: PlaceAutocompleteResult) => {
    try {
      setIsLoading(true);
      const placeDetails = await googleMapsService.getPlaceDetails(prediction.place_id);
      const parsedComponents = googleMapsService.parseAddressComponents(placeDetails.address_components);
      
      const addressData: AddressData = {
        formatted_address: placeDetails.formatted_address,
        street: `${parsedComponents.streetNumber || ''} ${parsedComponents.street || ''}`.trim(),
        city: parsedComponents.city || '',
        postalCode: parsedComponents.postalCode || '',
        country: parsedComponents.country || 'Israel',
        latitude: placeDetails.geometry.location.lat,
        longitude: placeDetails.geometry.location.lng,
      };

      setInputValue(addressData.formatted_address);
      onChange?.(addressData);
      setOpen(false);
      setPredictions([]);
    } catch (error) {
      console.error('Error getting place details:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לטעון פרטי הכתובת',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor="address-input">{label} {required && '*'}</Label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className={cn("flex-1 text-right", !inputValue && "text-muted-foreground")}>
                {inputValue || placeholder}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="חפש כתובת..."
              value={inputValue}
              onValueChange={handleInputChange}
            />
            <CommandList>
              {isLoading && (
                <CommandEmpty>מחפש כתובות...</CommandEmpty>
              )}
              {!isLoading && predictions.length === 0 && inputValue.length >= 3 && (
                <CommandEmpty>לא נמצאו כתובות</CommandEmpty>
              )}
              {!isLoading && predictions.length > 0 && (
                <CommandGroup>
                  {predictions.map((prediction) => (
                    <CommandItem
                      key={prediction.place_id}
                      onSelect={() => handleSelectPlace(prediction)}
                      className="cursor-pointer"
                    >
                      <MapPin className="ml-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span className="font-medium">{prediction.structured_formatting.main_text}</span>
                        <span className="text-sm text-gray-500">{prediction.structured_formatting.secondary_text}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value && typeof value.latitude === 'number' && typeof value.longitude === 'number' && (
        <div className="text-sm text-gray-500 space-y-1">
          <div>📍 {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}</div>
          {value.city && <div>🏙️ {value.city}</div>}
          {value.postalCode && <div>📮 {value.postalCode}</div>}
        </div>
      )}
    </div>
  );
};
