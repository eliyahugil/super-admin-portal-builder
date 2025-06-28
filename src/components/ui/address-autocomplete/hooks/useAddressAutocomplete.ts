
import { useState, useEffect, useCallback, useRef } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useAddressSearch } from './useAddressSearch';
import type { AddressData } from '../types';

interface PlaceAutocompleteResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export const useAddressAutocomplete = (
  value: AddressData | null,
  onChange: (addressData: AddressData | null) => void
) => {
  const [inputValue, setInputValue] = useState(value?.formatted_address || '');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isReady, isLoading, error, googleMapsService } = useGoogleMaps();
  const { suggestions, isLoadingSuggestions, searchPlaces, clearSuggestions } = useAddressSearch();
  
  // פישוט הלוגיקה - הדרופדאון יפתח אם יש פוקוס ויש הצעות או טעינה
  const shouldShowDropdown = isFocused && (suggestions.length > 0 || isLoadingSuggestions);
  
  console.log('🔍 useAddressAutocomplete - Full State Debug:', {
    inputValue: `"${inputValue}"`,
    isFocused,
    suggestionsCount: suggestions.length,
    isLoadingSuggestions,
    shouldShowDropdown,
    isReady,
    isLoading,
    error: error || 'none',
    suggestions: suggestions.slice(0, 3).map(s => s.description)
  });

  // Update input value when value prop changes
  useEffect(() => {
    if (value?.formatted_address !== inputValue) {
      console.log('📝 Value prop changed:', value?.formatted_address);
      setInputValue(value?.formatted_address || '');
    }
  }, [value?.formatted_address]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('⌨️ Input changed to:', `"${newValue}"`);
    
    setInputValue(newValue);
    
    // Clear selected value if input is manually changed
    if (value && newValue !== value.formatted_address) {
      console.log('🧹 Clearing selected value due to manual input change');
      onChange(null);
    }

    // Search for places immediately when typing
    if (newValue.trim().length >= 2) {
      console.log('🔍 Starting search for:', `"${newValue}"`);
      searchPlaces(newValue);
    } else {
      console.log('🧹 Clearing suggestions - query too short');
      clearSuggestions();
    }
  }, [value, onChange, searchPlaces, clearSuggestions]);

  const handleInputFocus = useCallback(() => {
    console.log('🎯 Input focused - setting isFocused to true');
    setIsFocused(true);
    
    // אם יש טקסט, תחפש מיד
    if (inputValue.trim().length >= 2) {
      console.log('🔍 Searching on focus for:', `"${inputValue}"`);
      searchPlaces(inputValue);
    }
  }, [inputValue, searchPlaces]);

  const handleInputBlur = useCallback(() => {
    console.log('😴 Input blur - will hide dropdown after delay');
    
    // תן זמן לקליק על הצעה
    setTimeout(() => {
      console.log('😴 Actually hiding dropdown now');
      setIsFocused(false);
    }, 200);
  }, []);

  const handleSuggestionClick = async (suggestion: PlaceAutocompleteResult) => {
    console.log('🖱️ Suggestion clicked:', suggestion.description);
    
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
      setIsFocused(false);
      
      // Blur the input to close mobile keyboard
      if (inputRef.current) {
        console.log('📱 Closing mobile keyboard after selection');
        inputRef.current.blur();
      }
      
      console.log('✅ Address selection completed');
    } catch (error) {
      console.error('💥 Error fetching place details:', error);
    }
  };

  const handleClear = useCallback(() => {
    console.log('🧹 Clearing input');
    setInputValue('');
    onChange(null);
    clearSuggestions();
  }, [onChange, clearSuggestions]);

  return {
    inputValue,
    suggestions,
    isOpen: shouldShowDropdown,
    isLoadingSuggestions,
    inputRef,
    dropdownRef,
    isReady,
    isLoading,
    error,
    handleInputChange,
    handleInputFocus,
    handleInputBlur,
    handleSuggestionClick,
    handleClear
  };
};
