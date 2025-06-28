
import { supabase } from '@/integrations/supabase/client';

export interface PlaceAutocompleteResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface PlaceDetails {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
}

export interface AddressComponents {
  street?: string;
  streetNumber?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

class GoogleMapsService {
  private apiKey: string | null = null;

  constructor() {
    // Initialize by fetching the API key on service creation
    this.initializeApiKey();
  }

  private async initializeApiKey(): Promise<void> {
    try {
      await this.refreshApiKey();
    } catch (error) {
      console.error('Failed to initialize Google Maps API key:', error);
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  async refreshApiKey(): Promise<void> {
    console.log('Refreshing Google Maps API key from global settings...');
    try {
      const { data, error } = await supabase
        .from('global_integrations')
        .select('config')
        .eq('integration_name', 'google_maps')
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching Google Maps global integration:', error);
        return;
      }

      if (data?.config?.api_key) {
        this.setApiKey(data.config.api_key);
        console.log('Google Maps API key loaded from global settings');
      } else {
        console.log('No Google Maps API key found in global settings');
      }
    } catch (error) {
      console.error('Failed to refresh Google Maps API key:', error);
    }
  }

  async testConnection(): Promise<boolean> {
    // Ensure we have the latest API key
    if (!this.apiKey) {
      await this.refreshApiKey();
    }

    if (!this.apiKey) {
      console.log('No API key available for Google Maps test');
      return false;
    }

    try {
      console.log('Testing Google Maps API connection...');
      // Test with a simple geocoding request to Tel Aviv
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=Tel Aviv, Israel&key=${this.apiKey}`
      );

      if (!response.ok) {
        console.log('Google Maps API test failed - HTTP error:', response.status);
        return false;
      }

      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        console.log('Google Maps API test successful');
        return true;
      } else {
        console.log('Google Maps API test failed - API error:', data.status, data.error_message);
        return false;
      }
    } catch (error) {
      console.error('Google Maps API test failed with exception:', error);
      return false;
    }
  }

  async getPlaceAutocomplete(input: string): Promise<PlaceAutocompleteResult[]> {
    // Ensure we have the latest API key
    if (!this.apiKey) {
      await this.refreshApiKey();
    }

    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${this.apiKey}&language=he&components=country:il`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch place autocomplete');
    }

    const data = await response.json();
    return data.predictions || [];
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    // Ensure we have the latest API key
    if (!this.apiKey) {
      await this.refreshApiKey();
    }

    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${this.apiKey}&language=he`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch place details');
    }

    const data = await response.json();
    return data.result;
  }

  parseAddressComponents(addressComponents: PlaceDetails['address_components']): AddressComponents {
    const components: AddressComponents = {};

    addressComponents.forEach(component => {
      const types = component.types;

      if (types.includes('street_number')) {
        components.streetNumber = component.long_name;
      } else if (types.includes('route')) {
        components.street = component.long_name;
      } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        components.city = component.long_name;
      } else if (types.includes('postal_code')) {
        components.postalCode = component.long_name;
      } else if (types.includes('country')) {
        components.country = component.long_name;
      }
    });

    return components;
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  isWithinRadius(
    centerLat: number,
    centerLon: number,
    pointLat: number,
    pointLon: number,
    radiusMeters: number
  ): boolean {
    const distance = this.calculateDistance(centerLat, centerLon, pointLat, pointLon);
    return distance <= radiusMeters;
  }
}

export const googleMapsService = new GoogleMapsService();
