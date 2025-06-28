
declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, options?: any);
    }

    namespace places {
      class AutocompleteService {
        getPlacePredictions(
          request: {
            input: string;
            componentRestrictions?: { country: string };
            language?: string;
          },
          callback: (
            predictions: AutocompletePrediction[] | null,
            status: PlacesServiceStatus
          ) => void
        ): void;
      }

      class PlacesService {
        constructor(map: Map);
        getDetails(
          request: {
            placeId: string;
            fields: string[];
            language?: string;
          },
          callback: (
            place: PlaceResult | null,
            status: PlacesServiceStatus
          ) => void
        ): void;
      }

      interface AutocompletePrediction {
        place_id?: string;
        description: string;
        structured_formatting?: {
          main_text?: string;
          secondary_text?: string;
        };
      }

      interface PlaceResult {
        formatted_address?: string;
        geometry?: {
          location?: {
            lat(): number;
            lng(): number;
          };
        };
        address_components?: {
          long_name: string;
          short_name: string;
          types: string[];
        }[];
      }

      enum PlacesServiceStatus {
        OK = 'OK',
        ZERO_RESULTS = 'ZERO_RESULTS',
        OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
        REQUEST_DENIED = 'REQUEST_DENIED',
        INVALID_REQUEST = 'INVALID_REQUEST',
        UNKNOWN_ERROR = 'UNKNOWN_ERROR'
      }
    }
  }
}
