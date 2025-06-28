
import type { PlaceAutocompleteResult } from './types';

export class GoogleMapsAutocomplete {
  constructor(private autocompleteService: google.maps.places.AutocompleteService) {}

  async getPlaceAutocomplete(input: string): Promise<PlaceAutocompleteResult[]> {
    console.log('🔍 GoogleMapsAutocomplete.getPlaceAutocomplete called with:', input);
    
    if (!this.autocompleteService) {
      console.error('❌ AutocompleteService not initialized');
      throw new Error('AutocompleteService not initialized');
    }

    console.log('📡 Making Google Maps API autocomplete request...');
    console.log('🏗️ AutocompleteService object:', this.autocompleteService);

    return new Promise((resolve, reject) => {
      const requestOptions = {
        input,
        componentRestrictions: { country: 'il' },
        language: 'he'
      };
      
      console.log('📤 Request options:', requestOptions);
      
      this.autocompleteService.getPlacePredictions(
        requestOptions,
        (predictions, status) => {
          console.log('📨 Google Maps API raw response:', { 
            status, 
            predictions,
            predictionsCount: predictions?.length || 0,
            statusEnum: google.maps.places.PlacesServiceStatus,
            actualStatus: status,
            availableStatuses: Object.keys(google.maps.places.PlacesServiceStatus)
          });
          
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            console.log('✅ Status is OK, processing predictions...');
            const results: PlaceAutocompleteResult[] = predictions.map(prediction => {
              console.log('🏠 Processing prediction:', prediction);
              return {
                place_id: prediction.place_id!,
                description: prediction.description,
                structured_formatting: {
                  main_text: prediction.structured_formatting?.main_text || '',
                  secondary_text: prediction.structured_formatting?.secondary_text || ''
                }
              };
            });
            console.log('✅ Successfully processed results:', results.length, results);
            resolve(results);
          } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            console.log('📭 Zero results from Google Maps API - this is normal for some searches');
            resolve([]);
          } else {
            console.error('❌ Google Maps API error status:', status);
            console.error('❌ Full error details:', { status, predictions });
            // Don't reject on API errors, just return empty array
            console.log('🔄 Returning empty array instead of throwing error');
            resolve([]);
          }
        }
      );
    });
  }
}
