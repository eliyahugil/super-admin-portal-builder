
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
    <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50"></div>
        <CardHeader className="relative pb-3" dir="rtl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {business.logo_url ? (
                <div className="relative">
                  <img 
                    src={business.logo_url} 
                    alt={business.name}
                    className="w-12 h-12 rounded-xl object-cover shadow-md"
                  />
                  <div className="absolute inset-0 rounded-xl shadow-inner"></div>
                </div>
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base sm:text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                  {business.name}
                </CardTitle>
                <Badge 
                  variant={business.is_active ? "default" : "secondary"}
                  className={`mt-1 text-xs ${business.is_active 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {business.is_active ? '✓ פעיל' : '○ לא פעיל'}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </div>
      
      <CardContent className="space-y-4 p-4 sm:p-6" dir="rtl">
        {business.description && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
              {business.description}
            </p>
          </div>
        )}
        
        {business.contact_email && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 rounded-lg p-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="truncate">{business.contact_email}</span>
          </div>
        )}
        
        <div className="flex flex-col gap-2 pt-2">
          <Button 
            onClick={() => onManage(business.id)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            size="sm"
          >
            <ExternalLink className="h-4 w-4" />
            <span>כניסה לעסק</span>
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => onEdit(business)}
            className="w-full border-2 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2"
            size="sm"
          >
            <Settings className="h-4 w-4" />
            <span>ניהול העסק</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
