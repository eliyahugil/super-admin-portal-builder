
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, Clock, Archive, FileText } from 'lucide-react';

interface EmployeeStatsCardsProps {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  archivedEmployees: number;
  branches: number;
}

export const EmployeeStatsCards: React.FC<EmployeeStatsCardsProps> = ({
  totalEmployees,
  activeEmployees,
  inactiveEmployees,
  archivedEmployees,
  branches
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6" dir="rtl">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="mr-4">
              <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
              <p className="text-gray-600">סך הכל עובדים</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-green-600" />
            <div className="mr-4">
              <p className="text-2xl font-bold text-gray-900">{activeEmployees}</p>
              <p className="text-gray-600">עובדים פעילים</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="mr-4">
              <p className="text-2xl font-bold text-gray-900">{inactiveEmployees}</p>
              <p className="text-gray-600">עובדים לא פעילים</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Archive className="h-8 w-8 text-gray-600" />
            <div className="mr-4">
              <p className="text-2xl font-bold text-gray-900">{archivedEmployees}</p>
              <p className="text-gray-600">עובדים בארכיון</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-purple-600" />
            <div className="mr-4">
              <p className="text-2xl font-bold text-gray-900">{branches}</p>
              <p className="text-gray-600">סניפים</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
