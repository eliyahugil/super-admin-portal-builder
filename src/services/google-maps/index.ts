
import { GoogleMapsService } from './GoogleMapsService';
import { GoogleMapsConfigManager } from './GoogleMapsConfig';
import { GoogleMapsClient } from './GoogleMapsClient';
import { GoogleMapsLoader } from './GoogleMapsLoader';
import { GoogleMapsServices } from './GoogleMapsServices';
import { GoogleMapsAutocomplete } from './GoogleMapsAutocomplete';
import { GoogleMapsPlaceDetails } from './GoogleMapsPlaceDetails';
import { GoogleMapsUtils } from './GoogleMapsUtils';

// Export all the classes
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
