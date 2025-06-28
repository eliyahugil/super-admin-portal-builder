
import type { AddressComponents, PlaceDetails } from './types';

export class GoogleMapsUtils {
  static parseAddressComponents(addressComponents: PlaceDetails['address_components']): AddressComponents {
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

  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in kilometers
    return d * 1000; // Convert to meters
  }

  static isWithinRadius(centerLat: number, centerLon: number, pointLat: number, pointLon: number, radiusMeters: number): boolean {
    const distance = this.calculateDistance(centerLat, centerLon, pointLat, pointLon);
    return distance <= radiusMeters;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
