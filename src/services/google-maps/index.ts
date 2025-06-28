
export { GoogleMapsService } from './GoogleMapsService';
export { GoogleMapsConfigManager } from './GoogleMapsConfig';
export { GoogleMapsClient } from './GoogleMapsClient';
export { GoogleMapsLoader } from './GoogleMapsLoader';
export { GoogleMapsServices } from './GoogleMapsServices';
export { GoogleMapsAutocomplete } from './GoogleMapsAutocomplete';
export { GoogleMapsPlaceDetails } from './GoogleMapsPlaceDetails';
export { GoogleMapsUtils } from './GoogleMapsUtils';
export type {
  PlaceAutocompleteResult,
  PlaceDetails,
  AddressComponents,
  GoogleMapsConfig
} from './types';

// Create and export the singleton instance
export const googleMapsService = new GoogleMapsService();
