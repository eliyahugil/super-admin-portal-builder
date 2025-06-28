
import React from 'react';
import { AddressAutocomplete, AddressData } from './AddressAutocomplete';
import { Input } from './input';
import { Label } from './label';

interface AddressFieldProps {
  label?: string;
  placeholder?: string;
  value?: AddressData | string | null;
  onChange: (addressData: AddressData | null) => void;
  required?: boolean;
  disabled?: boolean;
  fallbackMode?: boolean;
  showCoordinates?: boolean;
  className?: string;
}

export const AddressField: React.FC<AddressFieldProps> = ({
  label = 'כתובת',
  placeholder = 'חפש כתובת...',
  value,
  onChange,
  required = false,
  disabled = false,
  fallbackMode = false,
  showCoordinates = false,
  className,
}) => {
  // Convert string value to AddressData if needed
  const addressValue: AddressData | null = React.useMemo(() => {
    if (!value) return null;
    
    if (typeof value === 'string') {
      return {
        formatted_address: value,
        street: '',
        city: '',
        postalCode: '',
        country: 'Israel',
        latitude: 0,
        longitude: 0,
      };
    }
    
    return value;
  }, [value]);

  if (fallbackMode) {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && <Label htmlFor="address-fallback">{label}</Label>}
        <Input
          id="address-fallback"
          type="text"
          value={addressValue?.formatted_address || ''}
          onChange={(e) => {
            const newValue = e.target.value;
            if (newValue) {
              onChange({
                formatted_address: newValue,
                street: '',
                city: '',
                postalCode: '',
                country: 'Israel',
                latitude: 0,
                longitude: 0,
              });
            } else {
              onChange(null);
            }
          }}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="text-right"
        />
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <AddressAutocomplete
        label={label}
        placeholder={placeholder}
        value={addressValue}
        onChange={onChange}
        required={required}
        disabled={disabled}
      />
      
      {showCoordinates && addressValue?.latitude && addressValue?.longitude && (
        <div className="text-xs text-gray-500 flex justify-between">
          <span>קו רוחב: {addressValue.latitude.toFixed(6)}</span>
          <span>קו אורך: {addressValue.longitude.toFixed(6)}</span>
        </div>
      )}
    </div>
  );
};
