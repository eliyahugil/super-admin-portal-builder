
import { GoogleMapsConfigManager } from './GoogleMapsConfig';
import { GoogleMapsClient } from './GoogleMapsClient';
import { GoogleMapsUtils } from './GoogleMapsUtils';
import type { PlaceAutocompleteResult, PlaceDetails, AddressComponents } from './types';

export class GoogleMapsService {
  private configManager: GoogleMapsConfigManager;
  private client: GoogleMapsClient;

  constructor() {
    this.configManager = new GoogleMapsConfigManager();
    this.client = new GoogleMapsClient(this.configManager);
  }

  // Configuration methods
  setApiKey(apiKey: string): void {
    this.configManager.setApiKey(apiKey);
  }

  async refreshApiKey(): Promise<void> {
    await this.configManager.refreshApiKey();
  }

  async testConnection(): Promise<boolean> {
    return await this.configManager.testConnection();
  }

  // Client methods
  async getPlaceAutocomplete(input: string): Promise<PlaceAutocompleteResult[]> {
    return await this.client.getPlaceAutocomplete(input);
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    return await this.client.getPlaceDetails(placeId);
  }

  // Utility methods
  parseAddressComponents(addressComponents: PlaceDetails['address_components']): AddressComponents {
    return GoogleMapsUtils.parseAddressComponents(addressComponents);
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    return GoogleMapsUtils.calculateDistance(lat1, lon1, lat2, lon2);
  }

  isWithinRadius(
    centerLat: number,
    centerLon: number,
    pointLat: number,
    pointLon: number,
    radiusMeters: number
  ): boolean {
    return GoogleMapsUtils.isWithinRadius(centerLat, centerLon, pointLat, pointLon, radiusMeters);
  }
}
