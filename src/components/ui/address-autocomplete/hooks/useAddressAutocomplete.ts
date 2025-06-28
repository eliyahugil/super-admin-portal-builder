
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
  
  // הדרופדאון יוצג אם האינפוט מרוכז וגם יש הצעות או טעינה או אם יש טקסט באינפוט
  const shouldShowDropdown = isFocused && (suggestions.length > 0 || isLoadingSuggestions || inputValue.trim().length >= 1);
  
  console.log('🔍 useAddressAutocomplete - State Debug:', {
    inputValue: `"${inputValue}"`,
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

    // Search for places immediately when typing
    if (newValue.trim().length >= 2) {
      console.log('🔍 Starting search for:', `"${newValue}"`);
      searchPlaces(newValue);
    } else if (newValue.trim().length === 0) {
      console.log('🧹 Clearing suggestions - input is empty');
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

  const handleInputBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    console.log('😴 Input blur - checking relatedTarget');
    
    // בדיקה אם הקליק היה על הדרופדאון
    const relatedTarget = e.relatedTarget as HTMLElement;
    
    // אם הקליק היה על הדרופדאון או על אחד מהאלמנטים שלו, לא נסגור
    if (relatedTarget && dropdownRef.current?.contains(relatedTarget)) {
      console.log('😴 Blur ignored - clicked inside dropdown');
      // החזר פוקוס לאינפוט כדי שהמקלדת לא תיסגר
      if (inputRef.current) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      }
      return;
    }
    
    console.log('😴 Actually hiding dropdown now');
    setIsFocused(false);
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
