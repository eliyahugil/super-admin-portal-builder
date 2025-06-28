
import React from 'react';
import { MapPin } from 'lucide-react';

interface PlaceAutocompleteResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface SuggestionsDropdownProps {
  dropdownRef: React.RefObject<HTMLDivElement>;
  isOpen: boolean;
  suggestions: PlaceAutocompleteResult[];
  onSuggestionClick: (suggestion: PlaceAutocompleteResult) => void;
  isLoadingSuggestions: boolean;
}

export const SuggestionsDropdown: React.FC<SuggestionsDropdownProps> = ({
  dropdownRef,
  isOpen,
  suggestions,
  onSuggestionClick,
  isLoadingSuggestions,
}) => {
  console.log('🔍 SuggestionsDropdown render:', {
    isOpen,
    suggestionsCount: suggestions.length,
    isLoadingSuggestions,
    suggestions: suggestions.slice(0, 3)
  });

  // Show loading state if we're loading
  if (isLoadingSuggestions && isOpen) {
    console.log('⏳ Showing loading state in dropdown');
    return (
      <div
        ref={dropdownRef}
        className="absolute top-full left-0 right-0 z-[9999] bg-white border border-gray-200 rounded-md shadow-lg mt-1 p-4"
        dir="rtl"
      >
        <div className="text-center text-gray-500">מחפש כתובות...</div>
      </div>
    );
  }

  // Don't show if not open or no suggestions
  if (!isOpen || suggestions.length === 0) {
    console.log('❌ Not showing dropdown:', { isOpen, suggestionsCount: suggestions.length });
    return null;
  }

  console.log('✅ Rendering dropdown with suggestions');

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 z-[9999] bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1"
      dir="rtl"
    >
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.place_id}
          type="button"
          onMouseDown={(e) => {
            // מונע את ה-blur של השדה
            e.preventDefault();
          }}
          onClick={() => {
            console.log('🖱️ Suggestion clicked from dropdown');
            onSuggestionClick(suggestion);
          }}
          className="w-full text-right px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-100 transition-colors bg-white"
          tabIndex={0}
        >
          <div className="flex items-center justify-start space-x-2 space-x-reverse">
            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
            <div className="flex-1 text-right">
              <div className="font-medium text-sm text-gray-900">
                {suggestion.structured_formatting.main_text}
              </div>
              <div className="text-xs text-gray-500">
                {suggestion.structured_formatting.secondary_text}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
