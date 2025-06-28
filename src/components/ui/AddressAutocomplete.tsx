
import React from 'react';
import { Label } from '@/components/ui/label';
import { useAddressAutocomplete } from './address-autocomplete/hooks/useAddressAutocomplete';
import { AddressInput } from './address-autocomplete/components/AddressInput';
import { SuggestionsDropdown } from './address-autocomplete/components/SuggestionsDropdown';
import { LoadingState } from './address-autocomplete/components/LoadingState';
import { FallbackInput } from './address-autocomplete/components/FallbackInput';
import { DebugInfo } from './address-autocomplete/components/DebugInfo';
import type { AddressAutocompleteProps } from './address-autocomplete/types';

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  label = 'כתובת',
  placeholder = 'חפש כתובת...',
  value,
  onChange,
  required = false,
  disabled = false,
}) => {
  const {
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
  } = useAddressAutocomplete(value, onChange);

  // If Google Maps is loading, show loading state
  if (isLoading) {
    return <LoadingState label={label} />;
  }

  // If Google Maps is not available or has error, use fallback
  if (error || !isReady) {
    console.log('🔄 Using fallback mode due to:', { error, isReady });
    return (
      <FallbackInput
        label={label}
        inputValue={inputValue}
        onInputChange={(value) => handleInputChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>)}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        error={error}
      />
    );
  }

  return (
    <div className="space-y-2 relative">
      {label && <Label htmlFor="address-autocomplete">{label}</Label>}
      
      <AddressInput
        inputRef={inputRef}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onInputFocus={handleInputFocus}
        onClear={handleClear}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        isLoadingSuggestions={isLoadingSuggestions}
      />

      <SuggestionsDropdown
        dropdownRef={dropdownRef}
        isOpen={isOpen}
        suggestions={suggestions}
        onSuggestionClick={handleSuggestionClick}
        isLoadingSuggestions={isLoadingSuggestions}
      />
      
      <DebugInfo
        isOpen={isOpen}
        suggestionsCount={suggestions.length}
        isReady={isReady}
      />
    </div>
  );
};

// Export types for backward compatibility
export type { AddressData, AddressAutocompleteProps } from './address-autocomplete/types';
