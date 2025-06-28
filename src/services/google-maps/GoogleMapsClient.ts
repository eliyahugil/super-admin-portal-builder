
import type { PlaceAutocompleteResult, PlaceDetails } from './types';
import { GoogleMapsConfigManager } from './GoogleMapsConfig';

export class GoogleMapsClient {
  constructor(private configManager: GoogleMapsConfigManager) {}

  async getPlaceAutocomplete(input: string): Promise<PlaceAutocompleteResult[]> {
    if (!this.configManager.getApiKey()) {
      await this.configManager.refreshApiKey();
    }

    const apiKey = this.configManager.getApiKey();
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}&language=he&components=country:il`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch place autocomplete');
    }

    const data = await response.json();
    return data.predictions || [];
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    if (!this.configManager.getApiKey()) {
      await this.configManager.refreshApiKey();
    }

    const apiKey = this.configManager.getApiKey();
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&language=he`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch place details');
    }

    const data = await response.json();
    return data.result;
  }
}
