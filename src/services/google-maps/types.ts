
export interface GoogleMapsConfig {
  api_key: string;
}

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
  streetNumber?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}
