
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, AlertCircle } from 'lucide-react';
import type { AddressData } from '../types';

interface FallbackInputProps {
  label: string;
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onInputChange(value);
    
    // Create basic address data for fallback
    if (value.trim()) {
      onChange({
        formatted_address: value,
        street: value,
        city: '',
        postalCode: '',
        country: 'Israel',
        latitude: 0,
        longitude: 0,
      });
    } else {
      onChange(null);
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label htmlFor="address-fallback">{label}</Label>}
      
      {error && (
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
          <AlertCircle className="h-4 w-4" />
          <span>Google Maps לא זמין - הזן כתובת ידנית</span>
        </div>
      )}
      
      <div className="relative">
        <Input
          id="address-fallback"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="pr-10 pl-3 text-right"
          dir="rtl"
        />
        <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
};
