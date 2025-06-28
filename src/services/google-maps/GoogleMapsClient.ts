
import type { PlaceAutocompleteResult, PlaceDetails } from './types';
import { GoogleMapsConfigManager } from './GoogleMapsConfig';
import { GoogleMapsLoader } from './GoogleMapsLoader';
import { GoogleMapsServices } from './GoogleMapsServices';
import { GoogleMapsAutocomplete } from './GoogleMapsAutocomplete';
import { GoogleMapsPlaceDetails } from './GoogleMapsPlaceDetails';

export class GoogleMapsClient {
  private loader: GoogleMapsLoader;
  private services: GoogleMapsServices;
  private autocomplete: GoogleMapsAutocomplete | null = null;
  private placeDetails: GoogleMapsPlaceDetails | null = null;

  constructor(private configManager: GoogleMapsConfigManager) {
    this.loader = new GoogleMapsLoader(configManager);
    this.services = new GoogleMapsServices();
  }

  private async initializeServices(): Promise<void> {
    // Initialize the loader first
    await this.loader.initializeLoader();
    
    // Initialize the services
    await this.services.initializeServices();
    
    // Create service wrappers if not already created
    if (!this.autocomplete) {
      const autocompleteService = this.services.getAutocompleteService();
      if (autocompleteService) {
        this.autocomplete = new GoogleMapsAutocomplete(autocompleteService);
      }
    }
    
    if (!this.placeDetails) {
      const placesService = this.services.getPlacesService();
      if (placesService) {
        this.placeDetails = new GoogleMapsPlaceDetails(placesService);
      }
    }
  }

  async getPlaceAutocomplete(input: string): Promise<PlaceAutocompleteResult[]> {
    await this.initializeServices();
    
    if (!this.autocomplete) {
      throw new Error('Autocomplete service not initialized');
    }
    
    return this.autocomplete.getPlaceAutocomplete(input);
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    await this.initializeServices();
    
    if (!this.placeDetails) {
      throw new Error('Place details service not initialized');
    }
    
    return this.placeDetails.getPlaceDetails(placeId);
  }
}
