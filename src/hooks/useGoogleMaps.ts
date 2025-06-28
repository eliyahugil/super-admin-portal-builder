
import { useEffect, useState } from 'react';
import { googleMapsService } from '@/services/GoogleMapsService';

export const useGoogleMaps = () => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeService = async () => {
      try {
        console.log('Initializing Google Maps service...');
        setIsLoading(true);
        setError(null);
        
        // Refresh the API key from global settings
        await googleMapsService.refreshApiKey();
        
        // Test the connection
        console.log('Testing Google Maps connection...');
        const connectionTest = await googleMapsService.testConnection();
        console.log('Connection test result:', connectionTest);
        
        if (connectionTest) {
          setIsReady(true);
          console.log('Google Maps service is ready');
        } else {
          setError('Google Maps API connection test failed - בדוק שהגדרת את ה-API key בהגדרות האינטגרציות');
          console.error('Google Maps API connection test failed');
        }
      } catch (err) {
        console.error('Error initializing Google Maps service:', err);
        setError('Failed to initialize Google Maps service - בדוק שהגדרת את ה-API key בהגדרות האינטגרציות');
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
      console.log('Refreshing Google Maps service...');
      await googleMapsService.refreshApiKey();
      const connectionTest = await googleMapsService.testConnection();
      
      if (connectionTest) {
        setIsReady(true);
        console.log('Google Maps service refreshed successfully');
      } else {
        setError('Google Maps API connection test failed after refresh');
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
