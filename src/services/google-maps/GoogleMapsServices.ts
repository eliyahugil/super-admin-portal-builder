
// Global singleton instances for services
let globalAutocompletService: google.maps.places.AutocompleteService | null = null;
let globalPlacesService: google.maps.places.PlacesService | null = null;
let globalMapDiv: HTMLDivElement | null = null;

export class GoogleMapsServices {
  private autocompleteService: google.maps.places.AutocompleteService | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private mapDiv: HTMLDivElement | null = null;

  async initializeServices(): Promise<void> {
    // If already initialized, use global instances
    if (globalAutocompletService && globalPlacesService) {
      console.log('Using existing Google Maps services');
      this.autocompleteService = globalAutocompletService;
      this.placesService = globalPlacesService;
      this.mapDiv = globalMapDiv;
      return;
    }

    // Create services only once
    if (!globalAutocompletService) {
      console.log('Creating AutocompleteService...');
      globalAutocompletService = new google.maps.places.AutocompleteService();
    }
    
    if (!globalPlacesService) {
      console.log('Creating PlacesService...');
      // Create a hidden div for the PlacesService only once
      if (!globalMapDiv) {
        globalMapDiv = document.createElement('div');
        globalMapDiv.style.display = 'none';
        document.body.appendChild(globalMapDiv);
      }
      
      const map = new google.maps.Map(globalMapDiv, {
        center: { lat: 31.7683, lng: 35.2137 }, // Jerusalem coordinates
        zoom: 13
      });
      globalPlacesService = new google.maps.places.PlacesService(map);
    }
    
    // Assign global instances to class properties
    this.autocompleteService = globalAutocompletService;
    this.placesService = globalPlacesService;
    this.mapDiv = globalMapDiv;
    
    console.log('✅ Google Maps services initialized successfully');
  }

  getAutocompleteService(): google.maps.places.AutocompleteService | null {
    return this.autocompleteService;
  }

  getPlacesService(): google.maps.places.PlacesService | null {
    return this.placesService;
  }
}
