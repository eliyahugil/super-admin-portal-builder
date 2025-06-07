
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';
import { useUserBusinesses } from '@/hooks/useUserBusinesses';

export const BusinessSelector: React.FC = () => {
  const { data: userBusinesses, isLoading } = useUserBusinesses();
  const navigate = useNavigate();

  const handleBusinessSelect = (businessId: string) => {
    navigate(`/business/${businessId}/modules/employees`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userBusinesses || userBusinesses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>אין עסקים</CardTitle>
          </CardHeader>
          <CardContent>
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              אין לך עסקים רשומים במערכת
            </p>
            <p className="text-sm text-gray-500">
              אנא פנה למנהל המערכת להוספת עסקים
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userBusinesses.length === 1) {
    // If user has only one business, redirect automatically
    handleBusinessSelect(userBusinesses[0].business_id);
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            בחר עסק לניהול
          </h1>
          <p className="text-gray-600">
            יש לך {userBusinesses.length} עסקים במערכת
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userBusinesses.map((userBusiness) => (
            <Card key={userBusiness.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {userBusiness.business.logo_url ? (
                    <img 
                      src={userBusiness.business.logo_url} 
                      alt={userBusiness.business.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-8 w-8 text-blue-600" />
                  )}
                </div>
                <CardTitle className="text-xl">{userBusiness.business.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                {userBusiness.business.description && (
                  <p className="text-gray-600 mb-4 text-sm">
                    {userBusiness.business.description}
                  </p>
                )}
                <div className="mb-4">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {userBusiness.role}
                  </span>
                </div>
                <Button 
                  onClick={() => handleBusinessSelect(userBusiness.business_id)}
                  className="w-full"
                >
                  כנס לעסק
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
