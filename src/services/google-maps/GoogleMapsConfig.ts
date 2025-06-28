
import { supabase } from '@/integrations/supabase/client';
import type { GoogleMapsConfig } from './types';

export class GoogleMapsConfigManager {
  private apiKey: string | null = null;

  constructor() {
    this.initializeApiKey();
  }

  private async initializeApiKey(): Promise<void> {
    try {
      await this.refreshApiKey();
    } catch (error) {
      console.error('Failed to initialize Google Maps API key:', error);
    }
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  async refreshApiKey(): Promise<void> {
    console.log('Refreshing Google Maps API key from global settings...');
    try {
      const { data, error } = await supabase
        .from('global_integrations')
        .select('config')
        .eq('integration_name', 'google_maps')
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching Google Maps global integration:', error);
        return;
      }

      const config = data?.config as GoogleMapsConfig;
      if (config?.api_key) {
        this.setApiKey(config.api_key);
        console.log('Google Maps API key loaded from global settings');
      } else {
        console.log('No Google Maps API key found in global settings');
      }
    } catch (error) {
      console.error('Failed to refresh Google Maps API key:', error);
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.apiKey) {
      await this.refreshApiKey();
    }

    if (!this.apiKey) {
      console.log('No API key available for Google Maps test');
      return false;
    }

    try {
      console.log('Testing Google Maps API connection...');
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=Tel Aviv, Israel&key=${this.apiKey}`
      );

      if (!response.ok) {
        console.log('Google Maps API test failed - HTTP error:', response.status);
        return false;
      }

      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        console.log('Google Maps API test successful');
        return true;
      } else {
        console.log('Google Maps API test failed - API error:', data.status, data.error_message);
        return false;
      }
    } catch (error) {
      console.error('Google Maps API test failed with exception:', error);
      return false;
    }
  }
}
