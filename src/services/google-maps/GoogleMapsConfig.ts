
import { supabase } from '@/integrations/supabase/client';
import type { GoogleMapsConfig } from './types';

export class GoogleMapsConfigManager {
  private apiKey: string | null = null;
  private isLoading = false;

  constructor() {
    this.initializeApiKey();
  }

  private async initializeApiKey(): Promise<void> {
    if (this.isLoading) return;
    
    try {
      await this.refreshApiKey();
    } catch (error) {
      console.error('Failed to initialize Google Maps API key:', error);
    }
  }

  setApiKey(apiKey: string): void {
    console.log('🔑 Setting API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'null');
    this.apiKey = apiKey;
  }

  getApiKey(): string | null {
    console.log('🔑 Getting API key:', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'null');
    return this.apiKey;
  }

  async refreshApiKey(): Promise<void> {
    if (this.isLoading) {
      console.log('API key refresh already in progress, waiting...');
      // Wait for current refresh to complete
      while (this.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    this.isLoading = true;
    console.log('🔄 Refreshing Google Maps API key from global settings...');
    
    try {
      const { data, error } = await supabase
        .from('global_integrations')
        .select('config')
        .eq('integration_name', 'google_maps')
        .eq('is_active', true)
        .single();

      console.log('📊 Database query result:', { data, error });

      if (error) {
        console.error('❌ Error fetching Google Maps global integration:', error);
        return;
      }

      // Type guard to ensure we have valid config
      if (data?.config && typeof data.config === 'object' && !Array.isArray(data.config)) {
        const config = data.config as unknown as GoogleMapsConfig;
        console.log('🔧 Parsed config:', config);
        
        if (config?.api_key) {
          this.setApiKey(config.api_key);
          console.log('✅ Google Maps API key loaded from global settings');
        } else {
          console.log('❌ No Google Maps API key found in config');
        }
      } else {
        console.log('❌ Invalid or missing config in global settings');
      }
    } catch (error) {
      console.error('💥 Failed to refresh Google Maps API key:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async testConnection(): Promise<boolean> {
    console.log('🧪 Testing Google Maps connection...');
    
    if (!this.apiKey) {
      console.log('❌ No API key, attempting to refresh...');
      await this.refreshApiKey();
    }

    if (!this.apiKey) {
      console.log('❌ No API key available for Google Maps test');
      return false;
    }

    try {
      console.log('🚀 Testing Google Maps API connection with key:', `${this.apiKey.substring(0, 10)}...`);
      
      // Test by trying to load the Google Maps JavaScript API
      const { Loader } = await import('@googlemaps/js-api-loader');
      const testLoader = new Loader({
        apiKey: this.apiKey,
        version: 'weekly',
        libraries: ['places']
      });

      await testLoader.load();
      console.log('✅ Google Maps API test successful');
      return true;
      
    } catch (error) {
      console.error('❌ Google Maps API test failed with exception:', error);
      return false;
    }
  }
}
