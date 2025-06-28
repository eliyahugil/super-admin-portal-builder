
import type { PlaceAutocompleteResult, PlaceDetails } from './types';
import { GoogleMapsConfigManager } from './GoogleMapsConfig';
import { Loader } from '@googlemaps/js-api-loader';

export class GoogleMapsClient {
  private loader: Loader | null = null;
  private autocompleteService: google.maps.places.AutocompleteService | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private mapDiv: HTMLDivElement | null = null;

  constructor(private configManager: GoogleMapsConfigManager) {}

  private async initializeServices(): Promise<void> {
    if (this.autocompleteService && this.placesService) {
      return; // Already initialized
    }

    const apiKey = this.configManager.getApiKey();
    if (!apiKey) {
      await this.configManager.refreshApiKey();
      const refreshedApiKey = this.configManager.getApiKey();
      if (!refreshedApiKey) {
        throw new Error('Google Maps API key not configured');
      }
    }

    try {
      this.loader = new Loader({
        apiKey: apiKey || '',
        version: 'weekly',
        libraries: ['places']
      });

      await this.loader.load();
      
      this.autocompleteService = new google.maps.places.AutocompleteService();
      
      // Create a hidden div for the PlacesService
      if (!this.mapDiv) {
        this.mapDiv = document.createElement('div');
        this.mapDiv.style.display = 'none';
        document.body.appendChild(this.mapDiv);
      }
      
      const map = new google.maps.Map(this.mapDiv);
      this.placesService = new google.maps.places.PlacesService(map);
      
      console.log('Google Maps services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Maps services:', error);
      throw error;
    }
  }

  async getPlaceAutocomplete(input: string): Promise<PlaceAutocompleteResult[]> {
    await this.initializeServices();

    if (!this.autocompleteService) {
      throw new Error('AutocompleteService not initialized');
    }

    return new Promise((resolve, reject) => {
      this.autocompleteService!.getPlacePredictions(
        {
          input,
          componentRestrictions: { country: 'il' },
          language: 'he'
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            const results: PlaceAutocompleteResult[] = predictions.map(prediction => ({
              place_id: prediction.place_id!,
              description: prediction.description,
              structured_formatting: {
                main_text: prediction.structured_formatting?.main_text || '',
                secondary_text: prediction.structured_formatting?.secondary_text || ''
              }
            }));
            resolve(results);
          } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            resolve([]);
          } else {
            console.error('Autocomplete service error:', status);
            reject(new Error(`Autocomplete service failed: ${status}`));
          }
        }
      );
    });
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    await this.initializeServices();

    if (!this.placesService) {
      throw new Error('PlacesService not initialized');
    }

    return new Promise((resolve, reject) => {
      this.placesService!.getDetails(
        {
          placeId,
          fields: ['formatted_address', 'geometry', 'address_components'],
          language: 'he'
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            const result: PlaceDetails = {
              formatted_address: place.formatted_address!,
              geometry: {
                location: {
                  lat: place.geometry!.location!.lat(),
                  lng: place.geometry!.location!.lng()
                }
              },
              address_components: place.address_components!.map(component => ({
                long_name: component.long_name,
                short_name: component.short_name,
                types: component.types
              }))
            };
            resolve(result);
          } else {
            console.error('Places service error:', status);
            reject(new Error(`Places service failed: ${status}`));
          }
        }
      );
    });
  }
}
