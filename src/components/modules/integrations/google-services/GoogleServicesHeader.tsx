
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface GoogleServicesHeaderProps {
  oauthTokens: any[];
  isSyncing: boolean;
  onSyncAll: () => void;
}

export const GoogleServicesHeader: React.FC<GoogleServicesHeaderProps> = ({
  oauthTokens,
  isSyncing,
  onSyncAll
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>אינטגרציה מקיפה עם Google</CardTitle>
        <CardDescription>
          נהל את כל שירותי Google במקום אחד עם התחברות יחידה
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {oauthTokens.length > 0 ? 'מחובר לGoogle' : 'לא מחובר'}
            </span>
            {oauthTokens.length > 0 && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
          <Button 
            onClick={onSyncAll} 
            disabled={isSyncing || oauthTokens.length === 0}
            variant="outline"
          >
            {isSyncing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            סנכרן הכל
          </Button>
        </div>

        {oauthTokens.length === 0 && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>התחברות נדרשת</strong><br />
              התחבר לGoogle כדי להפעיל את כל השירותים
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
