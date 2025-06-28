
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AddressData } from '../types';

interface FallbackInputProps {
  label?: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  onChange: (addressData: AddressData | null) => void;
  placeholder: string;
  required: boolean;
  disabled: boolean;
  error?: string | null;
}

export const FallbackInput: React.FC<FallbackInputProps> = ({
  label,
  inputValue,
  onInputChange,
  onChange,
  placeholder,
  required,
  disabled,
  error,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onInputChange(value);
    // For fallback, create a simple address object
    onChange({
      formatted_address: value,
      street: value,
      city: '',
      postalCode: '',
      country: 'Israel',
      latitude: 0,
      longitude: 0,
    });
  };

  return (
    <div className="space-y-2">
      {label && <Label htmlFor="address-fallback">{label}</Label>}
      <Input
        id="address-fallback"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
      {error && (
        <p className="text-sm text-amber-600">
          שירות המפות לא זמין. אנא הזן כתובת ידנית.
        </p>
      )}
    </div>
  );
};
