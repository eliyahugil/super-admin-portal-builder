
export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface GeocodeResult {
  address_components: AddressComponent[];
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  place_id: string;
}

export interface PlaceAutocompleteResult {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

class GoogleMapsService {
  private apiKey: string | null = null;
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  constructor() {
    // Try to get API key from global configuration
    this.initializeApiKey();
  }

  private async initializeApiKey() {
    try {
      // In a real app, this would come from your global integrations table
      // For now, we'll use a placeholder that can be set via environment or configuration
      this.apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || null;
    } catch (error) {
      console.warn('Could not load Google Maps API key:', error);
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  async loadGoogleMapsScript(): Promise<void> {
    if (this.isLoaded) return Promise.resolve();
    if (this.loadPromise) return this.loadPromise;

    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    this.loadPromise = new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        this.isLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places&language=he&region=IL`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load Google Maps script'));
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  async geocodeAddress(address: string): Promise<GeocodeResult[]> {
    await this.loadGoogleMapsScript();

    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode(
        { 
          address, 
          region: 'IL',
          componentRestrictions: { country: 'IL' }
        },
        (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results) {
            resolve(results);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        }
      );
    });
  }

  async getPlaceAutocomplete(input: string): Promise<PlaceAutocompleteResult[]> {
    await this.loadGoogleMapsScript();

    return new Promise((resolve, reject) => {
      const service = new google.maps.places.AutocompleteService();
      
      service.getPlacePredictions(
        {
          input,
          componentRestrictions: { country: 'il' },
          language: 'he',
          types: ['address']
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            resolve(predictions);
          } else {
            resolve([]); // Return empty array instead of rejecting for better UX
          }
        }
      );
    });
  }

  async getPlaceDetails(placeId: string): Promise<GeocodeResult> {
    await this.loadGoogleMapsScript();

    return new Promise((resolve, reject) => {
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      
      service.getDetails(
        {
          placeId,
          fields: ['address_components', 'formatted_address', 'geometry', 'place_id']
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            resolve({
              address_components: place.address_components || [],
              formatted_address: place.formatted_address || '',
              geometry: {
                location: {
                  lat: place.geometry?.location?.lat() || 0,
                  lng: place.geometry?.location?.lng() || 0
                }
              },
              place_id: place.place_id || ''
            });
          } else {
            reject(new Error(`Place details failed: ${status}`));
          }
        }
      );
    });
  }

  parseAddressComponents(components: AddressComponent[]) {
    const result: Record<string, string> = {};
    
    components.forEach(component => {
      if (component.types.includes('street_number')) {
        result.streetNumber = component.long_name;
      }
      if (component.types.includes('route')) {
        result.street = component.long_name;
      }
      if (component.types.includes('locality')) {
        result.city = component.long_name;
      }
      if (component.types.includes('postal_code')) {
        result.postalCode = component.long_name;
      }
      if (component.types.includes('country')) {
        result.country = component.long_name;
      }
    });

    return result;
  }
}

export const googleMapsService = new GoogleMapsService();

// Global type declarations for Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}
