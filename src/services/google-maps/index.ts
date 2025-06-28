
import { GoogleMapsService } from './GoogleMapsService';
import { GoogleMapsConfigManager } from './GoogleMapsConfig';
import { GoogleMapsClient } from './GoogleMapsClient';
import { GoogleMapsUtils } from './GoogleMapsUtils';

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
