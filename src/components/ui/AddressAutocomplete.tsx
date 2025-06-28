
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2 } from 'lucide-react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import type { PlaceAutocompleteResult, PlaceDetails, AddressComponents } from '@/services/GoogleMapsService';

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
  onChange: (addressData: AddressData | null) => void;
  required?: boolean;
  disabled?: boolean;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  label = 'כתובת',
  placeholder = 'חפש כתובת...',
  value,
  onChange,
  required = false,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState(value?.formatted_address || '');
  const [suggestions, setSuggestions] = useState<PlaceAutocompleteResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const { isReady, isLoading, error, googleMapsService } = useGoogleMaps();

  console.log('AddressAutocomplete - State:', {
    isReady,
    isLoading,
    error,
    inputValue,
    suggestions: suggestions.length,
    isOpen
  });

  // Update input value when value prop changes
  useEffect(() => {
    setInputValue(value?.formatted_address || '');
  }, [value]);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchPlaces = async (query: string) => {
    console.log('searchPlaces called with:', query);
    
    if (!isReady || !query.trim() || query.length < 3) {
      console.log('Search cancelled - conditions not met:', { isReady, query: query.trim(), length: query.length });
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      console.log('Calling Google Maps API...');
      const results = await googleMapsService.getPlaceAutocomplete(query);
      console.log('Google Maps API results:', results);
      setSuggestions(results);
      setIsOpen(true);
    } catch (error) {
      console.error('Error fetching place suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('Input changed to:', newValue);
    setInputValue(newValue);
    
    // Clear selected value if input is manually changed
    if (value && newValue !== value.formatted_address) {
      onChange(null);
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce the search
    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(newValue);
    }, 500); // Increased debounce time
  };

  const handleSuggestionClick = async (suggestion: PlaceAutocompleteResult) => {
    console.log('Suggestion clicked:', suggestion);
    setIsLoadingSuggestions(true);
    try {
      const placeDetails = await googleMapsService.getPlaceDetails(suggestion.place_id);
      const addressComponents = googleMapsService.parseAddressComponents(placeDetails.address_components);
      
      const addressData: AddressData = {
        formatted_address: placeDetails.formatted_address,
        street: `${addressComponents.streetNumber || ''} ${addressComponents.street || ''}`.trim(),
        city: addressComponents.city || '',
        postalCode: addressComponents.postalCode || '',
        country: addressComponents.country || '',
        latitude: placeDetails.geometry.location.lat,
        longitude: placeDetails.geometry.location.lng,
      };

      console.log('Address data created:', addressData);
      setInputValue(placeDetails.formatted_address);
      onChange(addressData);
      setIsOpen(false);
      setSuggestions([]);
    } catch (error) {
      console.error('Error fetching place details:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleClear = () => {
    setInputValue('');
    onChange(null);
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // If Google Maps is loading, show loading state
  if (isLoading) {
    return (
      <div className="space-y-2">
        {label && <Label>{label}</Label>}
        <div className="flex items-center space-x-2 p-2 border rounded">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-gray-500">טוען שירות המפות...</span>
        </div>
      </div>
    );
  }

  // If Google Maps is not available or has error, use fallback
  if (error || !isReady) {
    console.log('Using fallback mode due to:', { error, isReady });
    return (
      <div className="space-y-2">
        {label && <Label htmlFor="address-fallback">{label}</Label>}
        <Input
          id="address-fallback"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            // For fallback, create a simple address object
            onChange({
              formatted_address: e.target.value,
              street: e.target.value,
              city: '',
              postalCode: '',
              country: 'Israel',
              latitude: 0,
              longitude: 0,
            });
          }}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />
        {error && (
          <p className="text-sm text-amber-600">
            שירות המפות לא זמין. אנא הזן כתובת ידנית.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2 relative">
      {label && <Label htmlFor="address-autocomplete">{label}</Label>}
      <div className="relative">
        <div className="relative">
          <Input
            id="address-autocomplete"
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => {
              console.log('Input focused');
              if (suggestions.length > 0) {
                setIsOpen(true);
              }
            }}
            placeholder={placeholder}
            required={required}
            disabled={disabled || isLoadingSuggestions}
            className="pl-10"
          />
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          {isLoadingSuggestions && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
          )}
        </div>
        
        {inputValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
          >
            ×
          </Button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-right px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50 transition-colors"
              disabled={isLoadingSuggestions}
            >
              <div className="flex items-center justify-end space-x-2 space-x-reverse">
                <div className="flex-1 text-right">
                  <div className="font-medium text-sm">
                    {suggestion.structured_formatting.main_text}
                  </div>
                  <div className="text-xs text-gray-500">
                    {suggestion.structured_formatting.secondary_text}
                  </div>
                </div>
                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
