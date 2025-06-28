
import { useState, useEffect, useCallback } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useAddressSearch } from './useAddressSearch';
import { useDropdownState } from './useDropdownState';
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
  const [hasFocus, setHasFocus] = useState(false);
  const { isReady, isLoading, error, googleMapsService } = useGoogleMaps();
  const { suggestions, isLoadingSuggestions, searchPlaces, clearSuggestions } = useAddressSearch();
  const { isOpen, inputRef, dropdownRef, openDropdown, closeDropdown } = useDropdownState();

  console.log('🔍 useAddressAutocomplete - State:', {
    isReady,
    isLoading,
    error,
    inputValue,
    suggestionsCount: suggestions.length,
    isOpen,
    isLoadingSuggestions,
    hasFocus
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

    // Search for places with debouncing
    if (newValue.trim().length >= 2) {
      searchPlaces(newValue);
    } else {
      clearSuggestions();
      closeDropdown();
    }
  }, [value, onChange, searchPlaces, clearSuggestions, closeDropdown]);

  const handleInputFocus = useCallback(() => {
    console.log('🎯 Input focused');
    setHasFocus(true);
    
    // Only open dropdown if we already have suggestions and input has content
    if (suggestions.length > 0 && inputValue.length >= 2) {
      console.log('📂 Opening dropdown on focus (has suggestions)');
      openDropdown();
    }
    
    // Trigger search if there's existing input
    if (inputValue.length >= 2) {
      console.log('🔍 Triggering search on focus with existing input:', inputValue);
      searchPlaces(inputValue);
    }
  }, [suggestions.length, inputValue, searchPlaces, openDropdown]);

  const handleInputBlur = useCallback(() => {
    console.log('😴 Input blurred');
    setHasFocus(false);
    // Don't close dropdown immediately - let click events on suggestions fire first
    setTimeout(() => {
      if (!hasFocus) {
        closeDropdown();
      }
    }, 150);
  }, [hasFocus, closeDropdown]);

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
      closeDropdown();
      clearSuggestions();
      setHasFocus(false);
      
      // Blur the input to close mobile keyboard
      if (inputRef.current) {
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
    closeDropdown();
    setHasFocus(false);
  }, [onChange, clearSuggestions, closeDropdown]);

  // Only update dropdown state when input has focus AND we have suggestions
  useEffect(() => {
    if (hasFocus && suggestions.length > 0 && inputValue.length >= 2) {
      console.log('📂 Opening dropdown due to new suggestions while focused');
      openDropdown();
    } else if (!hasFocus || suggestions.length === 0 || inputValue.length < 2) {
      console.log('📁 Closing dropdown - no focus or no suggestions');
      closeDropdown();
    }
  }, [suggestions.length, inputValue.length, hasFocus, openDropdown, closeDropdown]);

  return {
    inputValue,
    suggestions,
    isOpen,
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
