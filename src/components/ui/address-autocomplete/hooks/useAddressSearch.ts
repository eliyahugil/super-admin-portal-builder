
import { useState, useRef } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

interface PlaceAutocompleteResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export const useAddressSearch = () => {
  const [suggestions, setSuggestions] = useState<PlaceAutocompleteResult[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const { isReady, googleMapsService } = useGoogleMaps();

  const searchPlaces = async (query: string) => {
    console.log('🔎 searchPlaces called with query:', `"${query}"`);
    console.log('🔧 Current state - isReady:', isReady, 'googleMapsService available:', !!googleMapsService);
    
    if (!isReady) {
      console.log('❌ Google Maps not ready, skipping search');
      setSuggestions([]);
      return;
    }

    if (!query.trim() || query.length < 2) {
      console.log('❌ Query too short or empty, skipping search');
      setSuggestions([]);
      return;
    }

    console.log('🚀 Starting Google Maps API search...');
    setIsLoadingSuggestions(true);
    
    try {
      console.log('📡 Calling googleMapsService.getPlaceAutocomplete...');
      const results = await googleMapsService.getPlaceAutocomplete(query);
      console.log('✅ Google Maps API results received:', results.length, 'suggestions');
      
      if (results.length > 0) {
        console.log('📍 First few results:', results.slice(0, 3));
      } else {
        console.log('📭 No results found for query:', query);
      }
      
      setSuggestions(results);
      console.log('📊 State updated with suggestions:', results.length);
    } catch (error) {
      console.error('💥 Error fetching place suggestions:', error);
      console.error('🔍 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
      console.log('🏁 Search completed, isLoadingSuggestions set to false');
    }
  };

  const debouncedSearch = (query: string) => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      console.log('⏰ Clearing previous search timeout');
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce the search
    console.log('⏱️ Setting search timeout for 300ms for query:', `"${query}"`);
    searchTimeoutRef.current = setTimeout(() => {
      console.log('⏰ Search timeout triggered, calling searchPlaces');
      searchPlaces(query);
    }, 300);
  };

  const clearSuggestions = () => {
    console.log('🧹 Clearing suggestions');
    setSuggestions([]);
    setIsLoadingSuggestions(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  console.log('🔍 useAddressSearch current state:', {
    suggestionsCount: suggestions.length,
    isLoadingSuggestions,
    isReady
  });

  return {
    suggestions,
    isLoadingSuggestions,
    searchPlaces: debouncedSearch,
    clearSuggestions
  };
};
