
import { useState, useEffect, useRef } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import type { PlaceAutocompleteResult, PlaceDetails } from '@/services/GoogleMapsService';
import type { AddressData } from '../types';

export const useAddressAutocomplete = (
  value: AddressData | null,
  onChange: (addressData: AddressData | null) => void
) => {
  const [inputValue, setInputValue] = useState(value?.formatted_address || '');
  const [suggestions, setSuggestions] = useState<PlaceAutocompleteResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const { isReady, isLoading, error, googleMapsService } = useGoogleMaps();

  console.log('🔍 useAddressAutocomplete - State:', {
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
    handleSuggestionClick,
    handleClear
  };
};
