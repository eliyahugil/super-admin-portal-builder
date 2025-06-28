
// Central export point for all address-related components and utilities
export { AddressAutocomplete } from '../AddressAutocomplete';
export { AddressField } from '../AddressField';
export type { AddressData, AddressAutocompleteProps } from '../address-autocomplete/types';

// Re-export utilities
export * from '../../../utils/addressHelpers';
export { useAddressInput } from '../../../hooks/useAddressInput';
