
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

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getPlaceAutocomplete(input: string): Promise<PlaceAutocompleteResult[]> {
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
