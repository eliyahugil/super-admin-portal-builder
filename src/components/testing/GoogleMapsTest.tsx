
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { MapPin, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { PlaceAutocompleteResult } from '@/services/google-maps/types';

export const GoogleMapsTest: React.FC = () => {
  const { isReady, isLoading, error, googleMapsService } = useGoogleMaps();
  const [testAddress, setTestAddress] = useState('');
  const [testResults, setTestResults] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const runTest = async () => {
    if (!testAddress.trim()) return;
    
    setTesting(true);
    setTestResults(null);

    try {
      console.log('🔍 בודק Google Maps עם כתובת:', testAddress);
      
      // Test autocomplete
      const autocompleteResults = await googleMapsService.getPlaceAutocomplete(testAddress);
      console.log('📍 תוצאות Autocomplete:', autocompleteResults);

      if (autocompleteResults.length > 0) {
        // Test place details for the first result
        const placeDetails = await googleMapsService.getPlaceDetails(autocompleteResults[0].place_id);
        console.log('🏠 פרטי מקום:', placeDetails);

        // Parse address components
        const addressComponents = googleMapsService.parseAddressComponents(placeDetails.address_components);
        console.log('🔧 רכיבי כתובת:', addressComponents);

        setTestResults({
          autocomplete: autocompleteResults,
          placeDetails,
          addressComponents,
          success: true
        });
      } else {
        setTestResults({
          error: 'לא נמצאו תוצאות עבור הכתובת',
          success: false
        });
      }
    } catch (err: any) {
      console.error('❌ שגיאה בבדיקת Google Maps:', err);
      setTestResults({
        error: err.message || 'שגיאה בבדיקת Google Maps',
        success: false
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusBadge = () => {
    if (isLoading) {
      return <Badge variant="secondary">טוען...</Badge>;
    }
    if (error || !isReady) {
      return <Badge variant="destructive">לא פעיל</Badge>;
    }
    return <Badge variant="default" className="bg-green-500">פעיל</Badge>;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            בדיקת שירות Google Maps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>סטטוס שירות:</span>
            {getStatusBadge()}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {isReady && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="test-address">בדוק כתובת</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="test-address"
                    value={testAddress}
                    onChange={(e) => setTestAddress(e.target.value)}
                    placeholder="הזן כתובת לבדיקה (למשל: תל אביב, רחוב דיזנגוף)"
                    onKeyPress={(e) => e.key === 'Enter' && runTest()}
                  />
                  <Button 
                    onClick={runTest} 
                    disabled={testing || !testAddress.trim()}
                  >
                    {testing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'בדוק'
                    )}
                  </Button>
                </div>
              </div>

              {testResults && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {testResults.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      תוצאות בדיקה
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {testResults.success ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">תוצאות Autocomplete:</h4>
                          <div className="bg-gray-50 p-3 rounded-lg text-sm">
                            <p><strong>מספר תוצאות:</strong> {testResults.autocomplete.length}</p>
                            <p><strong>תוצאה ראשונה:</strong> {testResults.autocomplete[0]?.description}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">פרטי מקום:</h4>
                          <div className="bg-gray-50 p-3 rounded-lg text-sm">
                            <p><strong>כתובת מלאה:</strong> {testResults.placeDetails.formatted_address}</p>
                            <p><strong>קואורדינטות:</strong> {testResults.placeDetails.geometry.location.lat}, {testResults.placeDetails.geometry.location.lng}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">רכיבי כתובת:</h4>
                          <div className="bg-gray-50 p-3 rounded-lg text-sm">
                            <p><strong>רחוב:</strong> {testResults.addressComponents.street || 'לא זמין'}</p>
                            <p><strong>מספר בית:</strong> {testResults.addressComponents.streetNumber || 'לא זמין'}</p>
                            <p><strong>עיר:</strong> {testResults.addressComponents.city || 'לא זמין'}</p>
                            <p><strong>מיקוד:</strong> {testResults.addressComponents.postalCode || 'לא זמין'}</p>
                            <p><strong>מדינה:</strong> {testResults.addressComponents.country || 'לא זמין'}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-red-600">
                        <p>{testResults.error}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
