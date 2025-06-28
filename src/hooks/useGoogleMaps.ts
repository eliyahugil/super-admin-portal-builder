
import { useEffect, useState } from 'react';
import { googleMapsService } from '@/services/GoogleMapsService';

export const useGoogleMaps = () => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeService = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Refresh the API key from global settings
        await googleMapsService.refreshApiKey();
        
        // Test the connection
        const connectionTest = await googleMapsService.testConnection();
        
        if (connectionTest) {
          setIsReady(true);
        } else {
          setError('Google Maps API connection test failed');
        }
      } catch (err) {
        console.error('Error initializing Google Maps service:', err);
        setError('Failed to initialize Google Maps service');
      } finally {
        setIsLoading(false);
      }
    };

    initializeService();
  }, []);

  const refreshService = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await googleMapsService.refreshApiKey();
      const connectionTest = await googleMapsService.testConnection();
      
      if (connectionTest) {
        setIsReady(true);
      } else {
        setError('Google Maps API connection test failed');
      }
    } catch (err) {
      console.error('Error refreshing Google Maps service:', err);
      setError('Failed to refresh Google Maps service');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isReady,
    isLoading,
    error,
    refreshService,
    googleMapsService
  };
};
