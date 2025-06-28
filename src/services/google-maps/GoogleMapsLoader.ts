
import { Loader } from '@googlemaps/js-api-loader';
import type { GoogleMapsConfigManager } from './GoogleMapsConfig';

// Global singleton instances to prevent recreating the loader
let globalLoader: Loader | null = null;
let isInitialized = false;
let isInitializing = false;
let currentApiKey: string | null = null;

export class GoogleMapsLoader {
  private loader: Loader | null = null;

  constructor(private configManager: GoogleMapsConfigManager) {}

  async initializeLoader(): Promise<Loader> {
    const apiKey = this.configManager.getApiKey();
    if (!apiKey) {
      await this.configManager.refreshApiKey();
      const refreshedApiKey = this.configManager.getApiKey();
      if (!refreshedApiKey) {
        throw new Error('Google Maps API key not configured');
      }
    }

    const finalApiKey = this.configManager.getApiKey() || '';

    // If already initialized with the same API key, use global instance
    if (isInitialized && globalLoader && currentApiKey === finalApiKey) {
      console.log('Using existing Google Maps loader with same API key');
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
      
      if (isInitialized && globalLoader && currentApiKey === finalApiKey) {
        this.loader = globalLoader;
        return globalLoader;
      }
    }

    // Start initialization
    isInitializing = true;
    console.log('Starting Google Maps loader initialization with API key:', finalApiKey.substring(0, 10) + '...');

    try {
      // Reset previous loader if API key changed
      if (currentApiKey !== finalApiKey) {
        console.log('API key changed, creating new loader');
        globalLoader = null;
        isInitialized = false;
      }

      // Create loader only once with consistent parameters
      if (!globalLoader) {
        console.log('Creating new Google Maps Loader');
        globalLoader = new Loader({
          apiKey: finalApiKey,
          version: 'weekly',
          libraries: ['places'],
          language: 'he',
          region: 'IL'
        });
        currentApiKey = finalApiKey;
      }

      this.loader = globalLoader;
      
      console.log('Loading Google Maps API...');
      await this.loader.load();
      
      isInitialized = true;
      console.log('✅ Google Maps loader initialized successfully');
      
      return globalLoader;
      
    } catch (error) {
      console.error('❌ Failed to initialize Google Maps loader:', error);
      // Reset on error
      globalLoader = null;
      isInitialized = false;
      currentApiKey = null;
      throw error;
    } finally {
      isInitializing = false;
    }
  }

  getLoader(): Loader | null {
    return this.loader;
  }
}
