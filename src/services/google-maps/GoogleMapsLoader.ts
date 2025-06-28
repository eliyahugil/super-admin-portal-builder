
import { Loader } from '@googlemaps/js-api-loader';
import type { GoogleMapsConfigManager } from './GoogleMapsConfig';

// Global singleton instances to prevent recreating the loader
let globalLoader: Loader | null = null;
let isInitialized = false;
let isInitializing = false;

export class GoogleMapsLoader {
  private loader: Loader | null = null;

  constructor(private configManager: GoogleMapsConfigManager) {}

  async initializeLoader(): Promise<Loader> {
    // If already initialized, use global instance
    if (isInitialized && globalLoader) {
      console.log('Using existing Google Maps loader');
      this.loader = globalLoader;
      return globalLoader;
    }

    // If currently initializing, wait for it to complete
    if (isInitializing) {
      console.log('Waiting for Google Maps loader initialization to complete...');
      // Wait up to 10 seconds for initialization
      let attempts = 0;
      while (isInitializing && attempts < 100) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (isInitialized && globalLoader) {
        this.loader = globalLoader;
        return globalLoader;
      }
    }

    // Start initialization
    isInitializing = true;
    console.log('Starting Google Maps loader initialization...');

    try {
      const apiKey = this.configManager.getApiKey();
      if (!apiKey) {
        await this.configManager.refreshApiKey();
        const refreshedApiKey = this.configManager.getApiKey();
        if (!refreshedApiKey) {
          throw new Error('Google Maps API key not configured');
        }
      }

      // Create loader only once with consistent parameters
      if (!globalLoader) {
        console.log('Creating new Google Maps Loader with consistent settings');
        globalLoader = new Loader({
          apiKey: this.configManager.getApiKey() || '',
          version: 'weekly',
          libraries: ['places'],
          language: 'he',
          region: 'IL'
        });
      }

      this.loader = globalLoader;
      
      console.log('Loading Google Maps API...');
      await this.loader.load();
      
      isInitialized = true;
      console.log('✅ Google Maps loader initialized successfully');
      
      return globalLoader;
      
    } catch (error) {
      console.error('❌ Failed to initialize Google Maps loader:', error);
      throw error;
    } finally {
      isInitializing = false;
    }
  }

  getLoader(): Loader | null {
    return this.loader;
  }
}
