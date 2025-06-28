
import React from 'react';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface AddressInputProps {
  inputRef: React.RefObject<HTMLInputElement>;
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInputFocus: () => void;
  onInputBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onClear: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  isLoadingSuggestions?: boolean;
}

export const AddressInput: React.FC<AddressInputProps> = ({
  inputRef,
  inputValue,
  onInputChange,
  onInputFocus,
  onInputBlur,
  onClear,
  placeholder = 'חפש כתובת...',
  required = false,
  disabled = false,
  isLoadingSuggestions = false,
}) => {
  console.log('🎯 AddressInput render:', {
    inputValue: `"${inputValue}"`,
    isLoadingSuggestions,
    disabled
  });

  return (
    <div className="relative" dir="rtl">
      <Input
        ref={inputRef}
        id="address-autocomplete"
        type="text"
        value={inputValue}
        onChange={onInputChange}
        onFocus={onInputFocus}
        onBlur={onInputBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete="off"
        className="pr-10"
        // Prevent mobile keyboard from closing
        onTouchStart={(e) => {
          console.log('📱 Touch start on input');
          e.stopPropagation();
        }}
      />
      
      {/* Clear button */}
      {inputValue && !disabled && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🧹 Clear button clicked');
            onClear();
          }}
          onMouseDown={(e) => {
            // Prevent input from losing focus when clicking clear
            e.preventDefault();
          }}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      
      {/* Loading indicator */}
      {isLoadingSuggestions && (
        <div className="absolute left-8 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};
