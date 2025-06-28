
export interface AddressData {
  formatted_address: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface AddressAutocompleteProps {
  label?: string;
  placeholder?: string;
  value?: AddressData | null;
  onChange: (addressData: AddressData | null) => void;
  required?: boolean;
  disabled?: boolean;
}
