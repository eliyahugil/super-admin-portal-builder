
/// <reference types="google.maps" />

import { supabase } from '@/integrations/supabase/client';

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

// Declare global types for Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}

class GoogleMapsService {
  private apiKey: string | null = null;
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  constructor() {
    // Initialize API key from global configuration on startup
    this.initializeApiKey();
  }

  private async initializeApiKey() {
    try {
      console.log('=== GoogleMapsService: Initializing API Key ===');
      
      // First try to get from global integrations
      const { data: globalIntegrations, error } = await supabase
        .from('global_integrations')
        .select('config')
        .or('integration_name.eq.google_maps,integration_name.eq.GOOGLE_MAPS')
        .eq('is_active', true)
        .single();

      console.log('Global integrations query result:', { data: globalIntegrations, error });

      if (globalIntegrations?.config?.api_key) {
        this.apiKey = globalIntegrations.config.api_key;
        console.log('API Key loaded from global integrations:', this.apiKey ? 'Yes' : 'No');
      } else {
        // Fallback to environment variable
        this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || null;
        console.log('API Key loaded from environment:', this.apiKey ? 'Yes' : 'No');
      }
    } catch (error) {
      console.warn('Could not load Google Maps API key from global integrations:', error);
      // Fallback to environment variable
      this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || null;
      console.log('Fallback API Key from environment:', this.apiKey ? 'Yes' : 'No');
    }
  }

  // Method to refresh API key from database
  async refreshApiKey() {
    console.log('=== GoogleMapsService: Refreshing API Key ===');
    await this.initializeApiKey();
  }

  setApiKey(apiKey: string) {
    console.log('=== GoogleMapsService: Setting API Key manually ===');
    this.apiKey = apiKey;
  }

  async loadGoogleMapsScript(): Promise<void> {
    if (this.isLoaded) return Promise.resolve();
    if (this.loadPromise) return this.loadPromise;

    // Refresh API key before loading
    await this.refreshApiKey();

    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    console.log('=== GoogleMapsService: Loading Google Maps Script ===');
    console.log('Using API Key:', this.apiKey ? 'Configured' : 'Missing');

    this.loadPromise = new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        console.log('Google Maps already loaded');
        this.isLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places&language=he&region=IL`;
      script.async = true;
      script.defer = true;

      console.log('Loading Google Maps script from:', script.src);

      script.onload = () => {
        console.log('Google Maps script loaded successfully');
        this.isLoaded = true;
        resolve();
      };

      script.onerror = (error) => {
        console.error('Failed to load Google Maps script:', error);
        reject(new Error('Failed to load Google Maps script'));
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  async geocodeAddress(address: string): Promise<GeocodeResult[]> {
    console.log('=== GoogleMapsService: Geocoding Address ===');
    console.log('Address:', address);
    
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
          console.log('Geocoding result:', { status, results });
          
          if (status === google.maps.GeocoderStatus.OK && results) {
            // Convert Google Maps GeocoderResult to our GeocodeResult format
            const mappedResults: GeocodeResult[] = results.map((r) => ({
              address_components: r.address_components || [],
              formatted_address: r.formatted_address || '',
              geometry: {
                location: {
                  lat: r.geometry.location.lat(),
                  lng: r.geometry.location.lng()
                }
              },
              place_id: r.place_id || ''
            }));
            
            console.log('Mapped results:', mappedResults);
            resolve(mappedResults);
          } else {
            console.error('Geocoding failed:', status);
            reject(new Error(`Geocoding failed: ${status}`));
          }
        }
      );
    });
  }

  async getPlaceAutocomplete(input: string): Promise<PlaceAutocompleteResult[]> {
    console.log('=== GoogleMapsService: Getting Place Autocomplete ===');
    console.log('Input:', input);
    
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
          console.log('Autocomplete result:', { status, predictions });
          
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            resolve(predictions);
          } else {
            console.log('Autocomplete returned empty results, status:', status);
            resolve([]); // Return empty array instead of rejecting for better UX
          }
        }
      );
    });
  }

  async getPlaceDetails(placeId: string): Promise<GeocodeResult> {
    console.log('=== GoogleMapsService: Getting Place Details ===');
    console.log('Place ID:', placeId);
    
    await this.loadGoogleMapsScript();

    return new Promise((resolve, reject) => {
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      
      service.getDetails(
        {
          placeId,
          fields: ['address_components', 'formatted_address', 'geometry', 'place_id']
        },
        (place, status) => {
          console.log('Place details result:', { status, place });
          
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
            console.error('Place details failed:', status);
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

  // Test method to verify API connectivity
  async testConnection(): Promise<boolean> {
    try {
      console.log('=== GoogleMapsService: Testing Connection ===');
      await this.loadGoogleMapsScript();
      
      // Try a simple geocoding request
      const results = await this.geocodeAddress('תל אביב');
      console.log('Connection test successful:', results.length > 0);
      return results.length > 0;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export const googleMapsService = new GoogleMapsService();
