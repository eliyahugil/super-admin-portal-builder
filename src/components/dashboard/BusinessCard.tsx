
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Settings, ExternalLink } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  contact_email?: string;
  is_active: boolean;
  created_at: string;
}

interface BusinessCardProps {
  business: Business;
  onManage: (businessId: string) => void;
  onEdit: (business: Business) => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ business, onManage, onEdit }) => {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            {business.logo_url ? (
              <img 
                src={business.logo_url} 
                alt={business.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{business.name}</CardTitle>
              <Badge 
                variant={business.is_active ? "default" : "secondary"}
                className="mt-1"
              >
                {business.is_active ? 'פעיל' : 'לא פעיל'}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {business.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {business.description}
          </p>
        )}
        
        {business.contact_email && (
          <p className="text-sm text-gray-500">
            {business.contact_email}
          </p>
        )}
        
        <div className="flex flex-col space-y-2">
          <Button 
            onClick={() => onManage(business.id)}
            className="w-full flex items-center justify-center space-x-2 space-x-reverse"
          >
            <ExternalLink className="h-4 w-4" />
            <span>כניסה לעסק</span>
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => onEdit(business)}
            className="w-full flex items-center justify-center space-x-2 space-x-reverse"
          >
            <Settings className="h-4 w-4" />
            <span>ניהול העסק</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
