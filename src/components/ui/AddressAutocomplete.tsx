
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

  console.log('🔍 AddressAutocomplete render - State:', {
    isReady,
    isLoading,
    error,
    inputValue,
    suggestionsCount: suggestions.length,
    isOpen,
    isLoadingSuggestions
  });

  // Update input value when value prop changes
  useEffect(() => {
    console.log('📝 Value prop changed:', value?.formatted_address);
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
        console.log('👆 Click outside - closing dropdown');
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchPlaces = async (query: string) => {
    console.log('🔎 searchPlaces called with query:', `"${query}"`);
    console.log('🔎 Search conditions:', { 
      isReady, 
      queryTrimmed: query.trim(), 
      queryLength: query.length,
      minLength: 3 
    });
    
    if (!isReady) {
      console.log('❌ Google Maps not ready, skipping search');
      setSuggestions([]);
      return;
    }

    if (!query.trim() || query.length < 2) {
      console.log('❌ Query too short or empty, skipping search');
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    console.log('🚀 Starting Google Maps API search...');
    setIsLoadingSuggestions(true);
    
    try {
      const results = await googleMapsService.getPlaceAutocomplete(query);
      console.log('✅ Google Maps API results received:', results.length, 'suggestions');
      console.log('📋 First suggestion:', results[0]?.description);
      
      setSuggestions(results);
      
      if (results.length > 0) {
        console.log('📂 Opening dropdown with', results.length, 'suggestions');
        setIsOpen(true);
      } else {
        console.log('❌ No results, keeping dropdown closed');
        setIsOpen(false);
      }
    } catch (error) {
      console.error('💥 Error fetching place suggestions:', error);
      setSuggestions([]);
      setIsOpen(false);
    } finally {
      setIsLoadingSuggestions(false);
      console.log('🏁 Search completed');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('⌨️ Input changed from:', `"${inputValue}"`, 'to:', `"${newValue}"`);
    
    setInputValue(newValue);
    
    // Clear selected value if input is manually changed
    if (value && newValue !== value.formatted_address) {
      console.log('🧹 Clearing selected value due to manual input change');
      onChange(null);
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      console.log('⏰ Clearing previous search timeout');
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce the search
    console.log('⏱️ Setting search timeout for 300ms');
    searchTimeoutRef.current = setTimeout(() => {
      console.log('⏰ Search timeout triggered, calling searchPlaces');
      searchPlaces(newValue);
    }, 300);
  };

  const handleInputFocus = () => {
    console.log('🎯 Input focused');
    console.log('🎯 Current suggestions count:', suggestions.length);
    
    if (suggestions.length > 0) {
      console.log('📂 Opening dropdown on focus (has suggestions)');
      setIsOpen(true);
    }
    
    // Trigger search if there's existing input
    if (inputValue.length >= 2) {
      console.log('🔍 Triggering search on focus with existing input:', inputValue);
      searchPlaces(inputValue);
    }
  };

  const handleSuggestionClick = async (suggestion: PlaceAutocompleteResult) => {
    console.log('🖱️ Suggestion clicked:', suggestion.description);
    setIsLoadingSuggestions(true);
    
    try {
      console.log('📍 Getting place details for:', suggestion.place_id);
      const placeDetails = await googleMapsService.getPlaceDetails(suggestion.place_id);
      console.log('🏠 Place details received:', placeDetails.formatted_address);
      
      const addressComponents = googleMapsService.parseAddressComponents(placeDetails.address_components);
      console.log('🔧 Address components parsed:', addressComponents);
      
      const addressData: AddressData = {
        formatted_address: placeDetails.formatted_address,
        street: `${addressComponents.streetNumber || ''} ${addressComponents.street || ''}`.trim(),
        city: addressComponents.city || '',
        postalCode: addressComponents.postalCode || '',
        country: addressComponents.country || '',
        latitude: placeDetails.geometry.location.lat,
        longitude: placeDetails.geometry.location.lng,
      };

      console.log('📊 Final address data:', addressData);
      setInputValue(placeDetails.formatted_address);
      onChange(addressData);
      setIsOpen(false);
      setSuggestions([]);
      console.log('✅ Address selection completed');
    } catch (error) {
      console.error('💥 Error fetching place details:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleClear = () => {
    console.log('🧹 Clearing input');
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
    console.log('🔄 Using fallback mode due to:', { error, isReady });
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
            onFocus={handleInputFocus}
            placeholder={placeholder}
            required={required}
            disabled={disabled || isLoadingSuggestions}
            className="pl-10"
            autoComplete="off"
          />
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          {isLoadingSuggestions && (
            <Loader2 className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
          )}
        </div>
        
        {inputValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            tabIndex={-1}
          >
            ×
          </Button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-[9999] bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1"
          style={{ zIndex: 9999 }}
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-right px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-100 transition-colors bg-white"
              disabled={isLoadingSuggestions}
              tabIndex={0}
            >
              <div className="flex items-center justify-end space-x-2 space-x-reverse">
                <div className="flex-1 text-right">
                  <div className="font-medium text-sm text-gray-900">
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
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 mt-1">
          Debug: isOpen={isOpen.toString()}, suggestions={suggestions.length}, isReady={isReady.toString()}
        </div>
      )}
    </div>
  );
};
