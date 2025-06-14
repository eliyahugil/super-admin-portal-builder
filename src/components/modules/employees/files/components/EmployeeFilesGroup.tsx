
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { GroupedFiles, EmployeeFile } from '../types';
import { EmployeeFileCard } from './EmployeeFileCard';

interface EmployeeFilesGroupProps {
  group: GroupedFiles;
  isExpanded: boolean;
  onToggleExpansion: (employeeId: string) => void;
  onDownload: (file: EmployeeFile) => void;
}

export const EmployeeFilesGroup: React.FC<EmployeeFilesGroupProps> = ({
  group,
  isExpanded,
  onToggleExpansion,
  onDownload,
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => onToggleExpansion(group.employee.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
            
            <Badge variant="secondary" className="flex items-center gap-1">
              <span>{group.files.length} קבצים</span>
              <FileText className="h-3 w-3" />
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <h3 className="font-semibold text-lg">
                {group.employee.first_name} {group.employee.last_name}
              </h3>
              {group.employee.employee_id && (
                <p className="text-sm text-gray-600">
                  מזהה עובד: {group.employee.employee_id}
                </p>
              )}
            </div>
            
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {group.employee.first_name.charAt(0)}{group.employee.last_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="border-t pt-4">
            {group.files.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                אין קבצים עבור עובד זה
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.files.map((file) => (
                  <EmployeeFileCard
                    key={file.id}
                    file={file}
                    onDownload={onDownload}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
