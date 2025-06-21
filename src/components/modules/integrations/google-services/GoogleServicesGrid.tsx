
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { GoogleService } from './types';

interface GoogleServicesGridProps {
  services: GoogleService[];
}

export const GoogleServicesGrid: React.FC<GoogleServicesGridProps> = ({ services }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">מחובר</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">ממתין</Badge>;
      case 'error':
        return <Badge variant="destructive">שגיאה</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service) => {
        const IconComponent = service.icon;
        return (
          <Card key={service.id} className="relative">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <IconComponent className="h-6 w-6" />
                  <div>
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                </div>
                {getStatusIcon(service.status)}
              </div>
              
              <div className="space-y-2">
                {getStatusBadge(service.status)}
                
                <div className="text-xs text-gray-500 space-y-1">
                  <div>סנכרון אחרון: {service.lastSync}</div>
                  {service.status === 'connected' && (
                    <div>נתונים: {service.dataCount} פריטים</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
