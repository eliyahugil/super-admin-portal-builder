
export { GoogleMapsService } from './GoogleMapsService';
export { GoogleMapsConfigManager } from './GoogleMapsConfig';
export { GoogleMapsClient } from './GoogleMapsClient';
export { GoogleMapsUtils } from './GoogleMapsUtils';
export type {
  PlaceAutocompleteResult,
  PlaceDetails,
  AddressComponents,
  GoogleMapsConfig
} from './types';

// Create and export the singleton instance
export const googleMapsService = new GoogleMapsService();
