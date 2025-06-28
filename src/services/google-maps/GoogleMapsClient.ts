
import type { PlaceAutocompleteResult, PlaceDetails } from './types';
import { GoogleMapsConfigManager } from './GoogleMapsConfig';
import { Loader } from '@googlemaps/js-api-loader';

// Global singleton instances to prevent recreating the loader
let globalLoader: Loader | null = null;
let globalAutocompletService: google.maps.places.AutocompleteService | null = null;
let globalPlacesService: google.maps.places.PlacesService | null = null;
let globalMapDiv: HTMLDivElement | null = null;
let isInitialized = false;
let isInitializing = false;

export class GoogleMapsClient {
  private loader: Loader | null = null;
  private autocompleteService: google.maps.places.AutocompleteService | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private mapDiv: HTMLDivElement | null = null;

  constructor(private configManager: GoogleMapsConfigManager) {}

  private async initializeServices(): Promise<void> {
    // If already initialized, use global instances
    if (isInitialized && globalAutocompletService && globalPlacesService) {
      console.log('Using existing Google Maps services');
      this.loader = globalLoader;
      this.autocompleteService = globalAutocompletService;
      this.placesService = globalPlacesService;
      this.mapDiv = globalMapDiv;
      return;
    }

    // If currently initializing, wait for it to complete
    if (isInitializing) {
      console.log('Waiting for Google Maps initialization to complete...');
      // Wait up to 10 seconds for initialization
      let attempts = 0;
      while (isInitializing && attempts < 100) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (isInitialized && globalAutocompletService && globalPlacesService) {
        this.loader = globalLoader;
        this.autocompleteService = globalAutocompletService;
        this.placesService = globalPlacesService;
        this.mapDiv = globalMapDiv;
        return;
      }
    }

    // Start initialization
    isInitializing = true;
    console.log('Starting Google Maps initialization...');

    try {
      const apiKey = this.configManager.getApiKey();
      if (!apiKey) {
        await this.configManager.refreshApiKey();
        const refreshedApiKey = this.configManager.getApiKey();
        if (!refreshedApiKey) {
          throw new Error('Google Maps API key not configured');
        }
      }

      // Create loader only once with consistent parameters
      if (!globalLoader) {
        console.log('Creating new Google Maps Loader with consistent settings');
        globalLoader = new Loader({
          apiKey: this.configManager.getApiKey() || '',
          version: 'weekly',
          libraries: ['places'],
          language: 'he',
          region: 'IL'
        });
      }

      this.loader = globalLoader;
      
      console.log('Loading Google Maps API...');
      await this.loader.load();
      
      // Create services only once
      if (!globalAutocompletService) {
        console.log('Creating AutocompleteService...');
        globalAutocompletService = new google.maps.places.AutocompleteService();
      }
      
      if (!globalPlacesService) {
        console.log('Creating PlacesService...');
        // Create a hidden div for the PlacesService only once
        if (!globalMapDiv) {
          globalMapDiv = document.createElement('div');
          globalMapDiv.style.display = 'none';
          document.body.appendChild(globalMapDiv);
        }
        
        const map = new google.maps.Map(globalMapDiv, {
          center: { lat: 31.7683, lng: 35.2137 }, // Jerusalem coordinates
          zoom: 13
        });
        globalPlacesService = new google.maps.places.PlacesService(map);
      }
      
      // Assign global instances to class properties
      this.autocompleteService = globalAutocompletService;
      this.placesService = globalPlacesService;
      this.mapDiv = globalMapDiv;
      
      isInitialized = true;
      console.log('✅ Google Maps services initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Google Maps services:', error);
      throw error;
    } finally {
      isInitializing = false;
    }
  }

  async getPlaceAutocomplete(input: string): Promise<PlaceAutocompleteResult[]> {
    console.log('🔍 GoogleMapsClient.getPlaceAutocomplete called with:', input);
    
    await this.initializeServices();

    if (!this.autocompleteService) {
      throw new Error('AutocompleteService not initialized');
    }

    console.log('📡 Making Google Maps API autocomplete request...');

    return new Promise((resolve, reject) => {
      this.autocompleteService!.getPlacePredictions(
        {
          input,
          componentRestristics: { country: 'il' },
          language: 'he'
          // הסרנו את types כדי לקבל יותר תוצאות
        },
        (predictions, status) => {
          console.log('📨 Google Maps API response:', { 
            status, 
            predictionsCount: predictions?.length || 0,
            statusEnum: google.maps.places.PlacesServiceStatus,
            firstPrediction: predictions?.[0]?.description || 'none'
          });
          
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            const results: PlaceAutocompleteResult[] = predictions.map(prediction => ({
              place_id: prediction.place_id!,
              description: prediction.description,
              structured_formatting: {
                main_text: prediction.structured_formatting?.main_text || '',
                secondary_text: prediction.structured_formatting?.secondary_text || ''
              }
            }));
            console.log('✅ Successfully processed results:', results.length);
            if (results.length > 0) {
              console.log('📍 First result sample:', results[0]);
            }
            resolve(results);
          } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            console.log('📭 Zero results from Google Maps API');
            resolve([]);
          } else {
            console.error('❌ Google Maps API error status:', status);
            reject(new Error(`Autocomplete service failed with status: ${status}`));
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
