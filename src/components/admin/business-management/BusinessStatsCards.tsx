
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, CheckCircle, XCircle, Users } from 'lucide-react';

interface BusinessStatsCardsProps {
  totalBusinesses: number;
  activeBusinesses: number;
  totalEmployees: number;
}

export const BusinessStatsCards: React.FC<BusinessStatsCardsProps> = ({
  totalBusinesses,
  activeBusinesses,
  totalEmployees
}) => {
  const inactiveBusinesses = totalBusinesses - activeBusinesses;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-500" />
            <div className="mr-4">
              <p className="text-2xl font-bold">{totalBusinesses}</p>
              <p className="text-sm text-gray-600">סה"כ עסקים</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="mr-4">
              <p className="text-2xl font-bold">{activeBusinesses}</p>
              <p className="text-sm text-gray-600">עסקים פעילים</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-500" />
            <div className="mr-4">
              <p className="text-2xl font-bold">{inactiveBusinesses}</p>
              <p className="text-sm text-gray-600">עסקים לא פעילים</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-500" />
            <div className="mr-4">
              <p className="text-2xl font-bold">{totalEmployees}</p>
              <p className="text-sm text-gray-600">סה"כ עובדים</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
