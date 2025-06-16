
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Building, UserCheck, Briefcase } from 'lucide-react';
import { useAutoGroups } from '@/hooks/useAutoGroups';

export const AutoGroupsSection: React.FC = () => {
  const { suggestedGroups, isLoading, createAutoGroup, isCreatingAutoGroup } = useAutoGroups();

  const getIcon = (type: string) => {
    switch (type) {
      case 'branch':
        return <Building className="h-4 w-4" />;
      case 'role':
        return <Briefcase className="h-4 w-4" />;
      case 'employee_type':
        return <UserCheck className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'branch':
        return 'סניף';
      case 'role':
        return 'תפקיד';
      case 'employee_type':
        return 'סוג עובד';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            קבוצות מוצעות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestedGroups.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4" />
          קבוצות מוצעות ({suggestedGroups.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {suggestedGroups.map((criteria, index) => (
          <div key={index} className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50">
            <div className="flex items-center gap-2 flex-1">
              {getIcon(criteria.type)}
              <div className="flex-1">
                <p className="text-sm font-medium">{criteria.name}</p>
                <Badge variant="outline" className="text-xs">
                  {getTypeLabel(criteria.type)}
                </Badge>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => createAutoGroup(criteria)}
              disabled={isCreatingAutoGroup}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              צור
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
