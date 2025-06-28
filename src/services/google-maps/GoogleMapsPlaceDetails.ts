
import type { PlaceDetails } from './types';

export class GoogleMapsPlaceDetails {
  constructor(private placesService: google.maps.places.PlacesService) {}

  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    if (!this.placesService) {
      throw new Error('PlacesService not initialized');
    }

    return new Promise((resolve, reject) => {
      this.placesService.getDetails(
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
