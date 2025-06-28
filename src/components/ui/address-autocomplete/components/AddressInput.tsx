
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, X } from 'lucide-react';

interface AddressInputProps {
  inputRef: React.RefObject<HTMLInputElement>;
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInputFocus: () => void;
  onInputBlur: () => void;
  onClear: () => void;
  placeholder: string;
  required: boolean;
  disabled: boolean;
  isLoadingSuggestions: boolean;
}

export const AddressInput: React.FC<AddressInputProps> = ({
  inputRef,
  inputValue,
  onInputChange,
  onInputFocus,
  onInputBlur,
  onClear,
  placeholder,
  required,
  disabled,
  isLoadingSuggestions,
}) => {
  return (
    <div className="relative">
      <div className="relative">
        <Input
          id="address-autocomplete"
          ref={inputRef}
          value={inputValue}
          onChange={onInputChange}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled || isLoadingSuggestions}
          className="pr-10 pl-3 text-right"
          autoComplete="off"
          dir="rtl"
        />
        <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        {isLoadingSuggestions && (
          <Loader2 className="absolute left-10 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>
      
      {inputValue && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="absolute left-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-100"
          tabIndex={-1}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
