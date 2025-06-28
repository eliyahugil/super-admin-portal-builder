
import type { PlaceAutocompleteResult } from './types';

export class GoogleMapsAutocomplete {
  constructor(private autocompleteService: google.maps.places.AutocompleteService) {}

  async getPlaceAutocomplete(input: string): Promise<PlaceAutocompleteResult[]> {
    console.log('🔍 GoogleMapsAutocomplete.getPlaceAutocomplete called with:', input);
    
    if (!this.autocompleteService) {
      throw new Error('AutocompleteService not initialized');
    }

    console.log('📡 Making Google Maps API autocomplete request...');

    return new Promise((resolve, reject) => {
      this.autocompleteService.getPlacePredictions(
        {
          input,
          componentRestrictions: { country: 'il' },
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
}
