
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
  
  // הדרופדאון יוצג אם האינפוט מרוכז ויש טקסט או הצעות או טעינה
  const shouldShowDropdown = isFocused && (inputValue.trim().length >= 1 || suggestions.length > 0 || isLoadingSuggestions);
  
  console.log('🔍 useAddressAutocomplete - State Debug:', {
    inputValue: `"${inputValue}"`,
    inputValueLength: inputValue.length,
    isFocused,
    suggestionsCount: suggestions.length,
    isLoadingSuggestions,
    shouldShowDropdown,
    isReady,
    isLoading,
    error: error || 'none'
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

    // Search for places immediately when typing - reduced threshold to 1 character
    if (newValue.trim().length >= 1) {
      console.log('🔍 Triggering search for:', `"${newValue}"`);
      searchPlaces(newValue);
    } else {
      console.log('🧹 Clearing suggestions - input too short');
      clearSuggestions();
    }
  }, [value, onChange, searchPlaces, clearSuggestions]);

  const handleInputFocus = useCallback(() => {
    console.log('🎯 Input focused - setting isFocused to true');
    setIsFocused(true);
    
    // אם יש טקסט, תחפש מיד
    if (inputValue.trim().length >= 1) {
      console.log('🔍 Searching on focus for:', `"${inputValue}"`);
      searchPlaces(inputValue);
    }
  }, [inputValue, searchPlaces]);

  const handleInputBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    console.log('😴 Input blur event triggered');
    
    // Don't close dropdown immediately - give time for clicks
    setTimeout(() => {
      // Check if focus moved to dropdown or its children
      const activeElement = document.activeElement;
      const dropdownElement = dropdownRef.current;
      
      if (dropdownElement && (dropdownElement.contains(activeElement) || activeElement === dropdownElement)) {
        console.log('😴 Blur ignored - focus is on dropdown');
        return;
      }
      
      console.log('😴 Actually closing dropdown now');
      setIsFocused(false);
    }, 150); // Give time for click events to register
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
      
      // סגירת הדרופדאון אחרי בחירה
      setIsFocused(false);
      
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
