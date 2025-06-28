
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
    isLoadingSuggestions
  });

  if (!isOpen) {
    console.log('❌ Dropdown NOT OPEN - returning null');
    return null;
  }

  console.log('✅ Dropdown IS OPEN - rendering dropdown');

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 z-[9999] bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto"
      dir="rtl"
      style={{ backgroundColor: '#ffffff' }}
      onMouseDown={(e) => {
        // מניעת blur של האינפוט כאשר לוחצים על הדרופדאון
        console.log('🖱️ Dropdown mousedown - preventing blur');
        e.preventDefault();
        e.stopPropagation();
      }}
      onTouchStart={(e) => {
        // מניעת סגירה במובייל
        console.log('📱 Dropdown touch start - preventing blur');
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {isLoadingSuggestions ? (
        <div className="p-4 text-center text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            מחפש כתובות...
          </div>
        </div>
      ) : suggestions.length > 0 ? (
        suggestions.map((suggestion) => (
          <button
            key={suggestion.place_id}
            type="button"
            onMouseDown={(e) => {
              // מניעת blur של האינפוט
              console.log('🖱️ Suggestion mousedown - preventing blur');
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              // מניעת סגירה במובייל
              console.log('📱 Suggestion touch start');
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🖱️ Suggestion clicked from dropdown:', suggestion.description);
              onSuggestionClick(suggestion);
            }}
            className="w-full text-right px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-100 transition-colors bg-white"
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
        ))
      ) : (
        <div className="p-4 text-center text-gray-500">
          לא נמצאו כתובות - נסה חיפוש אחר
        </div>
      )}
    </div>
  );
};
