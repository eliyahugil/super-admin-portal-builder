
import { useState, useCallback } from 'react';
import { AddressData } from '@/components/ui/AddressAutocomplete';

interface UseAddressInputReturn {
  address: AddressData | null;
  addressString: string;
  setAddress: (address: AddressData | null) => void;
  setAddressString: (address: string) => void;
  handleAddressChange: (addressData: AddressData | null) => void;
  getCoordinates: () => { lat: number | null; lng: number | null };
  hasCoordinates: boolean;
  clearAddress: () => void;
}

export const useAddressInput = (initialAddress?: string | AddressData | null): UseAddressInputReturn => {
  const [address, setAddress] = useState<AddressData | null>(() => {
    if (typeof initialAddress === 'string') {
      return initialAddress ? {
        formatted_address: initialAddress,
        street: '',
        city: '',
        postalCode: '',
        country: 'Israel',
        latitude: 0,
        longitude: 0,
      } : null;
    }
    return initialAddress || null;
  });

  const addressString = address?.formatted_address || '';

  const handleAddressChange = useCallback((addressData: AddressData | null) => {
    setAddress(addressData);
  }, []);

  const setAddressString = useCallback((addressStr: string) => {
    if (addressStr) {
      setAddress({
        formatted_address: addressStr,
        street: '',
        city: '',
        postalCode: '',
        country: 'Israel',
        latitude: 0,
        longitude: 0,
      });
    } else {
      setAddress(null);
    }
  }, []);

  const getCoordinates = useCallback(() => ({
    lat: address?.latitude || null,
    lng: address?.longitude || null,
  }), [address]);

  const hasCoordinates = Boolean(address?.latitude && address?.longitude);

  const clearAddress = useCallback(() => {
    setAddress(null);
  }, []);

  return {
    address,
    addressString,
    setAddress,
    setAddressString,
    handleAddressChange,
    getCoordinates,
    hasCoordinates,
    clearAddress,
  };
};
