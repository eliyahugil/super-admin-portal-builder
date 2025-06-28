
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

    if (!query.trim() || query.length < 1) {
      console.log('❌ Query too short, clearing suggestions');
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    console.log('🚀 Starting Google Maps search - setting loading to TRUE');
    setIsLoadingSuggestions(true);
    
    try {
      console.log('📡 Calling googleMapsService.getPlaceAutocomplete...');
      
      const results = await googleMapsService.getPlaceAutocomplete(query);
      
      console.log('✅ Search completed successfully:', {
        resultsCount: results.length,
        results: results.slice(0, 3).map(r => r.description)
      });
      
      setSuggestions(results);
      console.log('📝 Suggestions state updated with', results.length, 'results');
      
    } catch (error) {
      console.error('💥 Error in searchPlaces:', error);
      setSuggestions([]);
      
      // Try to reinitialize the service on error
      console.log('🔄 Error occurred, not retrying to avoid infinite loops');
    } finally {
      console.log('🏁 Setting loading to FALSE');
      setIsLoadingSuggestions(false);
    }
  };

  // Reduced debounce time for faster response
  const debouncedSearch = (query: string) => {
    console.log('⏱️ debouncedSearch called with:', `"${query}"`);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      console.log('⏰ Clearing previous search timeout');
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce the search - reduced from 300ms to 200ms
    console.log('⏲️ Setting new search timeout (200ms)');
    searchTimeoutRef.current = setTimeout(() => {
      console.log('⏰ Timeout triggered, executing search for:', `"${query}"`);
      searchPlaces(query);
    }, 200);
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
