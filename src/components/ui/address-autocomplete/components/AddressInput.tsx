
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2 } from 'lucide-react';

interface AddressInputProps {
  inputRef: React.RefObject<HTMLInputElement>;
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInputFocus: () => void;
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
          placeholder={placeholder}
          required={required}
          disabled={disabled || isLoadingSuggestions}
          className="pl-10"
          autoComplete="off"
        />
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        {isLoadingSuggestions && (
          <Loader2 className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>
      
      {inputValue && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
          tabIndex={-1}
        >
          ×
        </Button>
      )}
    </div>
  );
};
