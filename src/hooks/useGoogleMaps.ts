
import { useEffect, useState } from 'react';
import { googleMapsService } from '@/services/GoogleMapsService';

export const useGoogleMaps = () => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeService = async () => {
      try {
        console.log('🚀 useGoogleMaps: Initializing Google Maps service...');
        setIsLoading(true);
        setError(null);
        
        // Refresh the API key from global settings
        console.log('🔄 useGoogleMaps: Refreshing API key...');
        await googleMapsService.refreshApiKey();
        
        // Test the connection
        console.log('🧪 useGoogleMaps: Testing Google Maps connection...');
        const connectionTest = await googleMapsService.testConnection();
        console.log('📊 useGoogleMaps: Connection test result:', connectionTest);
        
        if (connectionTest) {
          setIsReady(true);
          console.log('✅ useGoogleMaps: Google Maps service is ready');
        } else {
          const errorMsg = 'Google Maps API connection test failed - בדוק שהגדרת את ה-API key בהגדרות האינטגרציות';
          setError(errorMsg);
          console.error('❌ useGoogleMaps:', errorMsg);
        }
      } catch (err) {
        console.error('💥 useGoogleMaps: Error initializing Google Maps service:', err);
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
      console.log('🔄 useGoogleMaps: Refreshing Google Maps service...');
      await googleMapsService.refreshApiKey();
      const connectionTest = await googleMapsService.testConnection();
      
      if (connectionTest) {
        setIsReady(true);
        console.log('✅ useGoogleMaps: Google Maps service refreshed successfully');
      } else {
        setError('Google Maps API connection test failed after refresh');
      }
    } catch (err) {
      console.error('💥 useGoogleMaps: Error refreshing Google Maps service:', err);
      setError('Failed to refresh Google Maps service');
    } finally {
      setIsLoading(false);
    }
  };

  console.log('📊 useGoogleMaps current state:', { isReady, isLoading, error });

  return {
    isReady,
    isLoading,
    error,
    refreshService,
    googleMapsService
  };
};
