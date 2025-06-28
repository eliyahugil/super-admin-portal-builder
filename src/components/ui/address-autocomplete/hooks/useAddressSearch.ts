
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
    console.log('🔎 useAddressSearch.searchPlaces called with:', `"${query}"`);
    console.log('🔧 Google Maps state:', { isReady, googleMapsService: !!googleMapsService });
    
    if (!isReady || !googleMapsService) {
      console.log('❌ Google Maps not ready, skipping search');
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    if (!query.trim() || query.length < 2) {
      console.log('❌ Query too short, clearing suggestions');
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    console.log('🚀 Starting Google Maps search with valid conditions...');
    setIsLoadingSuggestions(true);
    
    try {
      console.log('📡 Calling googleMapsService.getPlaceAutocomplete...');
      const results = await googleMapsService.getPlaceAutocomplete(query);
      console.log('✅ Search completed successfully:', {
        resultsCount: results.length,
        firstResult: results[0]?.description || 'none'
      });
      
      setSuggestions(results);
      
    } catch (error) {
      console.error('💥 Error in searchPlaces:', error);
      console.error('🔍 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
      console.log('🏁 Search process completed, loading state cleared');
    }
  };

  const debouncedSearch = (query: string) => {
    console.log('⏱️ debouncedSearch called with:', `"${query}"`);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      console.log('⏰ Clearing previous search timeout');
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce the search
    console.log('⏲️ Setting new search timeout (300ms)');
    searchTimeoutRef.current = setTimeout(() => {
      console.log('⏰ Timeout triggered, executing search');
      searchPlaces(query);
    }, 300);
  };

  const clearSuggestions = () => {
    console.log('🧹 Clearing suggestions and timeouts');
    setSuggestions([]);
    setIsLoadingSuggestions(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = undefined;
    }
  };

  console.log('🔍 useAddressSearch render state:', {
    suggestionsCount: suggestions.length,
    isLoadingSuggestions,
    isReady,
    hasGoogleMapsService: !!googleMapsService
  });

  return {
    suggestions,
    isLoadingSuggestions,
    searchPlaces: debouncedSearch,
    clearSuggestions
  };
};
