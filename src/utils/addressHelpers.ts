
import { AddressData } from '@/components/ui/AddressAutocomplete';

export interface AddressFormData {
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  city?: string;
  postal_code?: string;
  country?: string;
}

export const addressDataToFormData = (addressData: AddressData | null): Partial<AddressFormData> => {
  if (!addressData) {
    return {
      address: '',
      latitude: null,
      longitude: null,
      city: '',
      postal_code: '',
      country: '',
    };
  }

  return {
    address: addressData.formatted_address,
    latitude: addressData.latitude || null,
    longitude: addressData.longitude || null,
    city: addressData.city || '',
    postal_code: addressData.postalCode || '',
    country: addressData.country || 'Israel',
  };
};

export const formDataToAddressData = (formData: AddressFormData): AddressData | null => {
  if (!formData.address) return null;

  return {
    formatted_address: formData.address,
    street: '',
    city: formData.city || '',
    postalCode: formData.postal_code || '',
    country: formData.country || 'Israel',
    latitude: formData.latitude || 0,
    longitude: formData.longitude || 0,
  };
};

export const extractAddressString = (value: AddressData | string | null): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.formatted_address;
};

export const hasValidCoordinates = (addressData: AddressData | null): boolean => {
  return Boolean(
    addressData?.latitude && 
    addressData?.longitude && 
    addressData.latitude !== 0 && 
    addressData.longitude !== 0
  );
};
